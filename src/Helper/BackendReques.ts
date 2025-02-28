import { API_BASE_URL } from "./constant";
import { FormEvent } from "react";

export async function backendRequest<SuccessResponse = { success: true }, ErrorResponse = { success: false | undefined, detail: string | object }>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string,
    path: string,
    body?: FormData | object,
    headers: Record<string, string> = {},
    multipart: boolean = false
): Promise<SuccessResponse | ErrorResponse> {
    const url: string = path.startsWith("http://") || path.startsWith("https://") ?
        path :
        (API_BASE_URL + path);

    const passableBody: FormData | string = multipart && body instanceof FormData ?
        body :
        JSON.stringify(
            body instanceof FormData ?
                Object.fromEntries(body.entries()) :
                body
        );

    const passableHeaders: Record<string, string> = headers;

    const token = localStorage.getItem("token");
    if (token) passableHeaders["Authorization"] = `Bearer ${token}`;
    if (!multipart) passableHeaders["Content-Type"] = "application/json";

    try {
         const response = await fetch(url, { method, body: passableBody, headers: passableHeaders });
         console.log(response.status);
        
        if (response.status == 401) {
            const errorResponse = await response.json();
            if (errorResponse.detail === "Could not validate credentials") {
                localStorage.removeItem('token');
                window.location.href = "/login";
            }
            return errorResponse as ErrorResponse;
        }

        return await response.json() as SuccessResponse;
    } catch (error) {
        console.error(error);
        return { success: false, detail: "There was a network error." } as ErrorResponse;
    }
}

export async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { action, method } = e.currentTarget;
    const data = new FormData(e.currentTarget);
    return await backendRequest(method, action, data);
}



export async function* backendStreamingRequest(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    body?: Record<string, any> | FormData | string | null,
    signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
    const url: string = path.startsWith("http://") || path.startsWith("https://") 
        ? path 
        : (API_BASE_URL + path);

    let headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (body instanceof FormData) {
        body = JSON.stringify(Object.fromEntries(body));
    } else if (typeof body === "object" && body !== null) {
        body = JSON.stringify(body);
    }

    let token: string | null;
    if ((token = localStorage.getItem("token"))) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { method, body, headers, signal });

        
        if (!response.ok) {
            let errorMessage = `HTTP Error ${response.status}`;
            try {
                const errorData = await response.json(); 
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (parseError) {
               
                errorMessage = await response.text();
            }

            throw new Error(errorMessage);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let chunk: ReadableStreamReadResult<Uint8Array>;

        do {
            chunk = await reader.read();
            if (chunk.value) yield decoder.decode(chunk.value);
        } while (!chunk.done);
        
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred");
    }
}





