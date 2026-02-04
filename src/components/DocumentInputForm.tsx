import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from 'react';
import { Form } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { JSONValue } from '@/types/json';
import { RJSFSchema, RJSFValidationError, UiSchema } from '@rjsf/utils';
import { IChangeEvent } from '@rjsf/core';

interface DocumentInputFormProps {
  schema: RJSFSchema;
  initialFormData?: Record<string, JSONValue>;
  uiSchema?: UiSchema;
  showErrorList?: 'bottom' | 'top' | false;
  children?: ReactNode;
  onSubmit: (e: IChangeEvent) => void;
}

export interface DocumentInputFormRef {
  submit: () => void;
}

export const DocumentInputForm = forwardRef<DocumentInputFormRef, DocumentInputFormProps>(
  ({ schema, initialFormData, uiSchema, showErrorList, children, onSubmit }, ref) => {
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const submitAttempted = useRef(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      submit: () => {
        submitAttempted.current = true;
        formRef.current?.submit();
      },
    }));

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

    return (
      <Form
        ref={formRef}
        liveValidate={'onChange'}
        showErrorList={showErrorList}
        schema={schema}
        initialFormData={initialFormData}
        uiSchema={uiSchema}
        validator={validator}
        onSubmit={onSubmit}
        onChange={onChange}
        onError={() => {}}
        transformErrors={transformErrors}
        omitExtraData
        noHtml5Validate
      >
        {children}
      </Form>
    );
  },
);

DocumentInputForm.displayName = 'DocumentInputForm';
