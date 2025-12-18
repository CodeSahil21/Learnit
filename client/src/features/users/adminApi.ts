import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin',
  }),
  endpoints: (builder) => ({
    // Add admin endpoints here
  }),
})

export const {} = adminApi