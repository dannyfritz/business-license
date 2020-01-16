import React from 'react';
import {
  EuiLink,
  EuiTitle,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
} from '@elastic/eui';

export const Content = ({ children, title, source }) => {
  return (
    <>
      <EuiPageHeader>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h2>{title}</h2>
          </EuiTitle>
        </EuiPageHeaderSection>
        <EuiPageHeaderSection>
          <EuiLink href={source}>
            Data Source
          </EuiLink>
        </EuiPageHeaderSection>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          { children }
        </EuiPageContentBody>
      </EuiPageContent>
    </>
  );
}
