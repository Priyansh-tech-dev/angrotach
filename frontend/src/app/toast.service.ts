import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    text: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts$ = new BehaviorSubject<Toast[]>([]);
    private counter = 0;

    show(text: string, type: 'success' | 'error' | 'info' = 'info') {
        const id = this.counter++;
        const toast: Toast = { text, type, id };
        this.toasts$.next([...this.toasts$.value, toast]);

        setTimeout(() => {
            this.remove(id);
        }, 3000);
    }

    remove(id: number) {
        this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
    }
}
