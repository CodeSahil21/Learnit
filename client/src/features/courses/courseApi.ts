import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/courses',
  }),
  endpoints: (builder) => ({
    // Add course endpoints here
  }),
})

export const {} = courseApi