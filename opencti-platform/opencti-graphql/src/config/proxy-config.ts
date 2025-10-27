import nconf from 'nconf';
import { booleanConf, loadCert, logApp } from '../config/conf';

// Configuration adapter interface for dependency injection
export interface ConfigAdapter {
  get(key: string): any;
  booleanConf(key: string, defaultValue: boolean): boolean;
  loadCert(cert: string | undefined): string | undefined;
}

// Default adapter using nconf and conf functions
export class DefaultConfigAdapter implements ConfigAdapter {
  // eslint-disable-next-line class-methods-use-this
  get(key: string): any {
    return nconf.get(key);
  }

  // eslint-disable-next-line class-methods-use-this
  booleanConf(key: string, defaultValue: boolean): boolean {
    return booleanConf(key, defaultValue);
  }

  // eslint-disable-next-line class-methods-use-this
  loadCert(cert: string | undefined): string | undefined {
    return loadCert(cert);
  }
}

// Validate NO_PROXY format for urllib.request compatibility
// urllib.request supports:
// - Hostnames: localhost, example.com
// - Leading dot domains: .example.com (matches all subdomains)
// - IP addresses: 127.0.0.1
// - Hostnames with port: localhost:8080
// - IPs with port: 127.0.0.1:8080
// Does NOT support: wildcards (*), CIDR ranges (/24)
const validateNoProxyForUrllib = (noProxyList: string[]): string[] => {
  const validEntries: string[] = [];
  const invalidEntries: string[] = [];

  noProxyList.forEach((item) => {
    if (!item) return;

    // Check for unsupported formats
    if (item.includes('*') && !item.startsWith('.')) {
      // Wildcard * is not supported (except leading dot)
      invalidEntries.push(item);
    } else if (/\/\d{1,2}$/.test(item)) {
      // CIDR notation is not supported
      invalidEntries.push(item);
    } else {
      // Valid format for urllib.request
      validEntries.push(item);
    }
  });

  // Log warning for invalid entries
  if (invalidEntries.length > 0) {
    logApp.warn('[CONNECTOR-PROXY] The following NO_PROXY entries are not compatible with Python urllib.request and will be excluded:', {
      invalid_entries: invalidEntries,
      reason: 'urllib.request does not support wildcard (*) patterns or CIDR notation (/24). Use leading dot (.example.com) for subdomain matching.'
    });
  }

  return validEntries;
};

/**
 * Get proxy configuration to inject into connector contract configurations
 * This is used to dynamically add proxy settings to managed connectors
 * @param configAdapter Optional config adapter for testing
 * @returns Object with proxy configuration keys for contract
 */
export const getProxyConfigurationForContract = (
  configAdapter: ConfigAdapter = new DefaultConfigAdapter()
): Record<string, string> => {
  // Use the provided config adapter to get proxy settings
  // nconf normalizes environment variables to lowercase
  const httpProxy = configAdapter.get('http_proxy') || '';
  const httpsProxy = configAdapter.get('https_proxy') || '';
  const noProxyRaw = (configAdapter.get('no_proxy') || '').split(',').filter(Boolean).map((s: string) => s.trim());

  // Validate NO_PROXY entries for urllib.request compatibility
  const noProxy = validateNoProxyForUrllib(noProxyRaw);

  // Get CA certificates from configuration and load their content
  const proxyCA = configAdapter.get('https_proxy_ca') || [];
  const caCertArray = Array.isArray(proxyCA) ? proxyCA : [proxyCA];
  // Load certificate content (from file if path, or pass through if already content)
  const caCertificates: string[] = caCertArray
    .filter((cert: any) => cert !== null && cert !== undefined && cert !== '')
    .map((cert: string) => configAdapter.loadCert(cert))
    .filter((cert): cert is string => cert !== undefined && cert !== null) as string[];

  // Return configuration in format suitable for contract injection
  return {
    HTTP_PROXY: httpProxy,
    HTTPS_PROXY: httpsProxy,
    NO_PROXY: noProxy.join(','),
    HTTPS_CA_CERTIFICATES: caCertificates.join('\n'),
    HTTPS_PROXY_REJECT_UNAUTHORIZED: String(configAdapter.booleanConf('https_proxy_reject_unauthorized', true))
  };
};

/**
 * Inject proxy configuration into existing contract configuration
 * Merges proxy settings with existing configuration, overwriting proxy-related keys
 * @param existingConfig Existing contract configuration array
 * @param configAdapter Optional config adapter for testing
 * @returns Updated configuration array with proxy settings
 */
export const injectProxyConfiguration = (
  existingConfig: Array<{ key: string; value: string }>,
  configAdapter: ConfigAdapter = new DefaultConfigAdapter()
): Array<{ key: string; value: string }> => {
  const proxyConfig = getProxyConfigurationForContract(configAdapter);

  // Filter out existing proxy keys
  const filteredConfig = existingConfig.filter(
    (item) => !['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'HTTPS_CA_CERTIFICATES', 'HTTPS_PROXY_REJECT_UNAUTHORIZED'].includes(item.key)
  );

  // Add proxy configuration
  const proxyConfigArray = Object.entries(proxyConfig).map(([key, value]) => ({
    key,
    value
  }));

  return [...filteredConfig, ...proxyConfigArray];
};
