// stores/useAuthStore.ts
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
  }),

  actions: {
    async authenticate(password: string) {
      try {
        const response = await fetch("http://localhost:5157/Auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        this.setToken(data.token);
        return true;
      } catch (error) {
        console.error("❌ Authentication Error:", error);
        return false;
      }
    },

    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    },

    logout() {
      this.setToken(null);
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
  },
});
