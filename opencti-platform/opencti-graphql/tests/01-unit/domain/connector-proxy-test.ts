import { describe, it, expect } from 'vitest';
import { getProxyConfigurationForContract, injectProxyConfiguration } from '../../../src/config/proxy-config';
import type { ConfigAdapter } from '../../../src/config/proxy-config';

// Test configuration adapter implementation
class TestConfigAdapter implements ConfigAdapter {
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  get(key: string): any {
    return this.config[key];
  }

  booleanConf(key: string, defaultValue: boolean): boolean {
    const value = this.config[key];
    if (value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value === '1' || value.toLowerCase() === 'true';
    }
    return defaultValue;
  }

  // eslint-disable-next-line class-methods-use-this
  loadCert(cert: string | undefined): string | undefined {
    if (!cert) return undefined;
    // Mock certificate loading - in tests, return a mock certificate content
    return `-----BEGIN CERTIFICATE-----\nMOCKED_CONTENT_FOR_${cert}\n-----END CERTIFICATE-----`;
  }
}

describe('Connector Proxy configuration tests', () => {
  describe('getProxyConfigurationForContract', () => {
    it('should return proxy configuration with all settings', () => {
      const configAdapter = new TestConfigAdapter({
        http_proxy: 'http://proxy.example.com:8080',
        https_proxy: 'https://secure-proxy.example.com:8443',
        no_proxy: 'localhost,127.0.0.1,.internal.domain',
        https_proxy_ca: ['/path/to/ca-cert.pem'],
        https_proxy_reject_unauthorized: true
      });

      const result = getProxyConfigurationForContract(configAdapter);

      expect(result).toBeDefined();
      expect(result.HTTP_PROXY).toBe('http://proxy.example.com:8080');
      expect(result.HTTPS_PROXY).toBe('https://secure-proxy.example.com:8443');
      expect(result.NO_PROXY).toBe('localhost,127.0.0.1,.internal.domain');
      expect(result.HTTPS_CA_CERTIFICATES).toContain('-----BEGIN CERTIFICATE-----');
      expect(result.HTTPS_PROXY_REJECT_UNAUTHORIZED).toBe('true');
    });

    it('should return empty proxy configuration when no proxy is set', () => {
      const configAdapter = new TestConfigAdapter({
        http_proxy: '',
        https_proxy: '',
        no_proxy: '',
        https_proxy_ca: [],
        https_proxy_reject_unauthorized: undefined
      });

      const result = getProxyConfigurationForContract(configAdapter);

      expect(result).toEqual({
        HTTP_PROXY: '',
        HTTPS_PROXY: '',
        NO_PROXY: '',
        HTTPS_CA_CERTIFICATES: '',
        HTTPS_PROXY_REJECT_UNAUTHORIZED: 'true'
      });
    });

    it('should handle credentials in proxy URLs correctly', () => {
      const configAdapter = new TestConfigAdapter({
        http_proxy: 'http://username:password@proxy.example.com:8080',
        https_proxy: 'https://user:pass@secure-proxy.example.com:8443',
        no_proxy: '',
        https_proxy_ca: []
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // Should preserve credentials in the URL
      expect(result.HTTP_PROXY).toBe('http://username:password@proxy.example.com:8080');
      expect(result.HTTPS_PROXY).toBe('https://user:pass@secure-proxy.example.com:8443');
    });

    it('should validate and filter NO_PROXY entries for urllib.request compatibility', () => {
      const configAdapter = new TestConfigAdapter({
        no_proxy: 'localhost,127.0.0.1,192.168.1.0/24,*.internal.com,.example.org,specific.domain.com',
        http_proxy: '',
        https_proxy: '',
        https_proxy_ca: []
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // urllib.request compatible formats should be kept
      const noProxyList = result.NO_PROXY.split(',');
      expect(noProxyList).toContain('localhost');
      expect(noProxyList).toContain('127.0.0.1');
      expect(noProxyList).toContain('.example.org');
      expect(noProxyList).toContain('specific.domain.com');

      // Incompatible formats should be filtered out
      expect(noProxyList).not.toContain('192.168.1.0/24'); // CIDR not supported
      expect(noProxyList).not.toContain('*.internal.com'); // Wildcard * not supported
    });

    it('should keep valid urllib.request NO_PROXY formats', () => {
      const configAdapter = new TestConfigAdapter({
        no_proxy: 'localhost,127.0.0.1:8080,.example.com,api.example.com,10.0.0.1',
        http_proxy: '',
        https_proxy: '',
        https_proxy_ca: []
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // All these are valid urllib.request formats
      expect(result.NO_PROXY).toBe('localhost,127.0.0.1:8080,.example.com,api.example.com,10.0.0.1');
      const noProxyList = result.NO_PROXY.split(',');
      expect(noProxyList).toContain('localhost');
      expect(noProxyList).toContain('127.0.0.1:8080'); // IP with port
      expect(noProxyList).toContain('.example.com'); // Leading dot
      expect(noProxyList).toContain('api.example.com'); // Hostname
      expect(noProxyList).toContain('10.0.0.1'); // IP
      expect(noProxyList).toHaveLength(5);
    });

    it('should filter out urllib.request incompatible NO_PROXY formats', () => {
      const configAdapter = new TestConfigAdapter({
        no_proxy: '*.example.com,192.168.0.0/16,10.0.0.0/8,*,*.*.example.com',
        http_proxy: '',
        https_proxy: '',
        https_proxy_ca: []
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // All entries should be filtered out as they use wildcards or CIDR
      expect(result.NO_PROXY).toBe('');
    });

    it('should handle CA certificates from configuration', () => {
      const configAdapter = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_ca: ['/path/to/ca-cert.pem', '/path/to/ssl-cert.pem', '/path/to/ca-bundle.pem'],
        http_proxy: '',
        no_proxy: ''
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // Now we expect concatenated certificate content
      const certificates = result.HTTPS_CA_CERTIFICATES.split('\n-----BEGIN CERTIFICATE-----');
      expect(certificates).toHaveLength(3);
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/ca-cert.pem');
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/ssl-cert.pem');
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/ca-bundle.pem');
    });

    it('should handle https_proxy_reject_unauthorized setting', () => {
      // Test with rejection disabled
      const configAdapter1 = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_reject_unauthorized: '0',
        http_proxy: '',
        no_proxy: '',
        https_proxy_ca: []
      });

      let result = getProxyConfigurationForContract(configAdapter1);
      expect(result.HTTPS_PROXY_REJECT_UNAUTHORIZED).toBe('false');

      // Test with rejection enabled
      const configAdapter2 = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_reject_unauthorized: '1',
        http_proxy: '',
        no_proxy: '',
        https_proxy_ca: []
      });

      result = getProxyConfigurationForContract(configAdapter2);
      expect(result.HTTPS_PROXY_REJECT_UNAUTHORIZED).toBe('true');

      // Test with undefined (default to true)
      const configAdapter3 = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_reject_unauthorized: undefined,
        http_proxy: '',
        no_proxy: '',
        https_proxy_ca: []
      });

      result = getProxyConfigurationForContract(configAdapter3);
      expect(result.HTTPS_PROXY_REJECT_UNAUTHORIZED).toBe('true');
    });

    it('should handle whitespace in NO_PROXY correctly', () => {
      const configAdapter = new TestConfigAdapter({
        no_proxy: ' localhost , 127.0.0.1 , .internal.com ',
        http_proxy: '',
        https_proxy: '',
        https_proxy_ca: []
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // Should trim whitespace
      expect(result.NO_PROXY).toBe('localhost,127.0.0.1,.internal.com');
      const noProxyList = result.NO_PROXY.split(',');
      expect(noProxyList).toContain('localhost');
      expect(noProxyList).toContain('127.0.0.1');
      expect(noProxyList).toContain('.internal.com');
      expect(noProxyList).toHaveLength(3);
    });

    it('should handle CA certificates as a single string', () => {
      const configAdapter = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_ca: '/path/to/single-cert.pem',
        http_proxy: '',
        no_proxy: ''
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // Now we expect concatenated certificate content
      expect(result.HTTPS_CA_CERTIFICATES).toContain('-----BEGIN CERTIFICATE-----');
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/single-cert.pem');
    });

    it('should filter out empty CA certificate entries', () => {
      const configAdapter = new TestConfigAdapter({
        https_proxy: 'https://secure-proxy.example.com:8443',
        https_proxy_ca: ['/path/to/cert1.pem', '', null, '/path/to/cert2.pem'],
        http_proxy: '',
        no_proxy: ''
      });

      const result = getProxyConfigurationForContract(configAdapter);

      // Now we expect concatenated certificate content
      const certificates = result.HTTPS_CA_CERTIFICATES.split('\n-----BEGIN CERTIFICATE-----');
      expect(certificates).toHaveLength(2);
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/cert1.pem');
      expect(result.HTTPS_CA_CERTIFICATES).toContain('MOCKED_CONTENT_FOR_/path/to/cert2.pem');
    });
  });

  describe('injectProxyConfiguration', () => {
    it('should inject proxy configuration into existing contract configuration', () => {
      const existingConfig = [
        { key: 'IPINFO_TOKEN', value: 'test-token' },
        { key: 'CONNECTOR_AUTO', value: 'true' }
      ];

      const configAdapter = new TestConfigAdapter({
        http_proxy: 'http://proxy.example.com:8080',
        https_proxy: 'https://secure-proxy.example.com:8443',
        no_proxy: 'localhost,127.0.0.1',
        https_proxy_ca: [],
        https_proxy_reject_unauthorized: true
      });

      const result = injectProxyConfiguration(existingConfig, configAdapter);

      // Original config should be preserved
      expect(result.find((item) => item.key === 'IPINFO_TOKEN')).toEqual({ key: 'IPINFO_TOKEN', value: 'test-token' });
      expect(result.find((item) => item.key === 'CONNECTOR_AUTO')).toEqual({ key: 'CONNECTOR_AUTO', value: 'true' });

      // Proxy config should be added
      expect(result.find((item) => item.key === 'HTTP_PROXY')).toEqual({ key: 'HTTP_PROXY', value: 'http://proxy.example.com:8080' });
      expect(result.find((item) => item.key === 'HTTPS_PROXY')).toEqual({ key: 'HTTPS_PROXY', value: 'https://secure-proxy.example.com:8443' });
      expect(result.find((item) => item.key === 'NO_PROXY')).toEqual({ key: 'NO_PROXY', value: 'localhost,127.0.0.1' });
      expect(result.find((item) => item.key === 'HTTPS_PROXY_REJECT_UNAUTHORIZED')).toEqual({ key: 'HTTPS_PROXY_REJECT_UNAUTHORIZED', value: 'true' });
    });

    it('should overwrite existing proxy configuration', () => {
      const existingConfig = [
        { key: 'IPINFO_TOKEN', value: 'test-token' },
        { key: 'HTTP_PROXY', value: 'old-proxy' },
        { key: 'NO_PROXY', value: 'old-no-proxy' }
      ];

      const configAdapter = new TestConfigAdapter({
        http_proxy: 'http://new-proxy.example.com:8080',
        https_proxy: '',
        no_proxy: 'localhost',
        https_proxy_ca: [],
        https_proxy_reject_unauthorized: false
      });

      const result = injectProxyConfiguration(existingConfig, configAdapter);

      // Original non-proxy config should be preserved
      expect(result.find((item) => item.key === 'IPINFO_TOKEN')).toEqual({ key: 'IPINFO_TOKEN', value: 'test-token' });

      // Old proxy config should be replaced
      expect(result.filter((item) => item.key === 'HTTP_PROXY')).toHaveLength(1);
      expect(result.find((item) => item.key === 'HTTP_PROXY')).toEqual({ key: 'HTTP_PROXY', value: 'http://new-proxy.example.com:8080' });
      expect(result.find((item) => item.key === 'NO_PROXY')).toEqual({ key: 'NO_PROXY', value: 'localhost' });
      expect(result.find((item) => item.key === 'HTTPS_PROXY_REJECT_UNAUTHORIZED')).toEqual({ key: 'HTTPS_PROXY_REJECT_UNAUTHORIZED', value: 'false' });
    });

    it('should add proxy configuration to empty existing config', () => {
      const existingConfig: Array<{ key: string; value: string }> = [];

      const configAdapter = new TestConfigAdapter({
        http_proxy: 'http://proxy.example.com:8080',
        https_proxy: '',
        no_proxy: '',
        https_proxy_ca: [],
        https_proxy_reject_unauthorized: true
      });

      const result = injectProxyConfiguration(existingConfig, configAdapter);

      expect(result).toHaveLength(5); // 5 proxy configuration keys
      expect(result.find((item) => item.key === 'HTTP_PROXY')).toBeDefined();
      expect(result.find((item) => item.key === 'HTTPS_PROXY')).toBeDefined();
      expect(result.find((item) => item.key === 'NO_PROXY')).toBeDefined();
      expect(result.find((item) => item.key === 'HTTPS_CA_CERTIFICATES')).toBeDefined();
      expect(result.find((item) => item.key === 'HTTPS_PROXY_REJECT_UNAUTHORIZED')).toBeDefined();
    });
  });
});
