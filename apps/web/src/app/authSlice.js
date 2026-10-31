import { createSlice } from "@reduxjs/toolkit";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem("bidnest-auth")) ?? { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: read(),
  reducers: {
    setCredentials: (_state, { payload }) => {
      localStorage.setItem("bidnest-auth", JSON.stringify(payload));
      return payload; // { token, user }
    },
    logout: () => {
      localStorage.removeItem("bidnest-auth");
      return { token: null, user: null };
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
