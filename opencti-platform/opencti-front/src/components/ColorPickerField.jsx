import React from 'react';
import { SketchPicker } from 'react-color';
import { useField } from 'formik';
import { fieldToTextField } from 'formik-mui';
import { ColorLens } from '@mui/icons-material';
import { isNil } from 'ramda';
import { IconButton, InputAdornment, TextField as MuiTextField, Popover } from '@components';

const ColorPickerField = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const {
    form: { setFieldValue, setFieldTouched },
    field: { name },
    onChange,
    onFocus,
    onSubmit,
  } = props;
  const [, meta] = useField(name);

  const internalOnChange = React.useCallback(
    (event) => {
      const { value } = event.target;
      setFieldValue(name, value);
      if (typeof onChange === 'function') {
        onChange(name, value);
      }
    },
    [setFieldValue, onChange, name],
  );
  const internalOnFocus = React.useCallback(() => {
    if (typeof onFocus === 'function') {
      onFocus(name);
    }
  }, [onFocus, name]);
  const internalOnBlur = React.useCallback(
    (event) => {
      const { value } = event.target;
      setFieldTouched(name, true);
      if (typeof onSubmit === 'function') {
        onSubmit(name, value || '');
      }
    },
    [setFieldTouched, onSubmit, name],
  );
  const handleChange = () => {
    setFieldTouched(name, true);
    setAnchorEl(null);
    if (typeof onChange === 'function') {
      onChange(name, meta.value || '');
    }
    if (typeof onSubmit === 'function') {
      onSubmit(name, meta.value || '');
    }
  };

  const { value, ...otherProps } = fieldToTextField(props);

  return (
    <>
      <MuiTextField
        {...otherProps}
        value={value ?? ''}
        error={!isNil(meta.error)}
        helperText={!isNil(meta.error) ? meta.error : props.helperText}
        onChange={internalOnChange}
        onFocus={internalOnFocus}
        onBlur={internalOnBlur}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: meta.value || '',
                  }}
                />
                <IconButton aria-label="open" onClick={handleClick} size="large">
                  <ColorLens/>
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleChange}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SketchPicker
          color={meta.value || ''}
          onChangeComplete={(color) => setFieldValue(name, color.hex)}
        />
      </Popover>
    </>
  );
};

export default ColorPickerField;
