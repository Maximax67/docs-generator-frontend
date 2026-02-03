import { FC, MouseEvent, useRef, useState } from 'react';
import { Form } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { Alert, Button, CircularProgress, Divider } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { JSONValue } from '@/types/json';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import { IChangeEvent } from '@rjsf/core';

interface DocumentInputFormProps {
  schema: RJSFSchema;
  initialFormData?: Record<string, JSONValue>;
  error?: string | null;
  isGenerating?: boolean;
  onSubmit: (e: IChangeEvent) => void;
}

export const DocumentInputForm: FC<DocumentInputFormProps> = ({
  schema,
  initialFormData,
  error,
  isGenerating,
  onSubmit,
}) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const submitAttempted = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null);

  const transformErrors = (errors: RJSFValidationError[]) => {
    if (submitAttempted.current) {
      return errors;
    }

    return errors.filter((error) => {
      let fieldId = undefined;

      if (error.property) {
        fieldId = 'root_' + error.property.replace(/^\./, '').replace(/\./g, '_');
      } else if (error.params?.missingProperty) {
        fieldId = 'root_' + error.params.missingProperty;
      }

      return fieldId && touchedFields.has(fieldId);
    });
  };

  const onChange = (_data: IChangeEvent, id?: string) => {
    if (!submitAttempted.current && id) {
      setTouchedFields((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submitAttempted.current = true;
    formRef.current?.submit();
  };

  return (
    <Form
      ref={formRef}
      liveValidate={'onChange'}
      showErrorList={'bottom'}
      schema={schema}
      initialFormData={initialFormData}
      validator={validator}
      onSubmit={onSubmit}
      onChange={onChange}
      onError={() => {}}
      transformErrors={transformErrors}
      omitExtraData
      noHtml5Validate
    >
      <Divider sx={{ my: 3 }} />

      {error && (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        type="submit"
        startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
        disabled={isGenerating}
        onClick={onClick}
        sx={{
          minWidth: { xs: '100%', sm: 200 },
          mb: 2,
        }}
      >
        {isGenerating ? 'Генерація...' : 'Згенерувати PDF'}
      </Button>
    </Form>
  );
};
