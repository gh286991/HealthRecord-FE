"use client";

import { createApi } from '@reduxjs/toolkit/query/react';
import { jsonBaseQuery } from '@/lib/rtkBase';

export type LegalLatestVersions = {
  terms: string;
  privacy: string;
  termsEffectiveDate?: string;
  privacyEffectiveDate?: string;
};

export type CreateAgreementBody = {
  userId: string;
  doc: 'terms' | 'privacy' | 'cookies';
  version?: string;
};

export const legalApiRtk = createApi({
  reducerPath: 'legalApi',
  baseQuery: jsonBaseQuery,
  endpoints: (builder) => ({
    latestVersions: builder.query<LegalLatestVersions, void>({
      query: () => ({ url: '/legal/latest-versions' }),
    }),
    createAgreement: builder.mutation<{ ok: boolean }, CreateAgreementBody>({
      query: (body) => ({ url: '/agreements', method: 'POST', body }),
    }),
  }),
});

export const {
  useLatestVersionsQuery,
  useLazyLatestVersionsQuery,
  useCreateAgreementMutation,
} = legalApiRtk;

