import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../../share/service/permission.service';

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
    private permissions: string[] = [];
    private destroy$ = new Subject<void>();

    @Input() set appHasPermission(permissions: string | string[]) {
        this.permissions = Array.isArray(permissions) ? permissions : [permissions];
        this.updateView();
    }

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private permissionService: PermissionService
    ) { }

    ngOnInit() {
        this.permissionService.permissions$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.updateView();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private updateView() {
        const hasPermission = this.permissionService.hasAnyPermission(this.permissions);

        if (hasPermission) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}