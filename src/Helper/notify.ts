import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export const notyf = new Notyf({
    duration: 8000,
    dismissible: true
});

export function notifyResponse(
    response: object, 
    successMessage: string = "Operation Performed successfully.",
    errorMessage: string = "There was an error."
) {
    console.log("notif response",response);  
    if ('success' in response && response.success) {
        notyf.success(
            'detail' in response && typeof response.detail === 'string' ? 
            response.detail : 
            successMessage
        );
    } else if ('detail' in response && typeof response.detail === 'string') {
        notyf.error(response.detail || errorMessage);
    } else {
        notyf.error("There was an error");
    }
}