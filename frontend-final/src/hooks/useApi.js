import { useMemo } from "react";
import { API } from "../utils/constants";

export function useApi(token) {
    return useMemo(() => {
        return async (path, options = {}) => {
            const isFormData = options.body instanceof FormData;
            const headers = { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
            if (token) headers.Authorization = `Bearer ${token}`;
            const response = await fetch(API + path, { ...options, headers });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || "Request failed");
            return data;
        };
    }, [token]);
}
