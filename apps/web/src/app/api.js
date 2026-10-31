import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Any 401 on a protected call logs the user out.
const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  const isAuthCall =
    typeof args === "object" &&
    (args.url?.startsWith("/auth/login") || args.url?.startsWith("/auth/register"));
  if (result.error?.status === 401 && !isAuthCall && api.getState().auth.token) {
    api.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Auction", "AuctionList"],
  endpoints: (b) => ({
    register: b.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: b.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    listAuctions: b.query({
      query: (params) => ({ url: "/auctions", params }),
      providesTags: ["AuctionList"],
    }),
    getAuction: b.query({
      query: (id) => `/auctions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Auction", id }],
    }),
    createAuction: b.mutation({
      query: (body) => ({ url: "/auctions", method: "POST", body }),
      invalidatesTags: ["AuctionList"],
    }),
    placeBid: b.mutation({
      query: ({ id, amount }) => ({
        url: `/auctions/${id}/bids`,
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Auction", id }, "AuctionList"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useListAuctionsQuery,
  useGetAuctionQuery,
  useCreateAuctionMutation,
  usePlaceBidMutation,
} = api;
