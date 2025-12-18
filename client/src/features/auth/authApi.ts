import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
  }),
  endpoints: (builder) => ({
    // Add auth endpoints here
  }),
})

export const {} = authApi