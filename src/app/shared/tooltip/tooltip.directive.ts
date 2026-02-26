import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnDestroy,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') tooltipText = '';
  @Input() tooltipSide: 'top' | 'right' | 'bottom' | 'left' = 'right';

  private tooltipEl: HTMLDivElement | null = null;
  private showListener!: () => void;
  private hideListener!: () => void;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.showListener = this.renderer.listen(
      this.el.nativeElement,
      'mouseenter',
      () => this.show()
    );
    this.hideListener = this.renderer.listen(
      this.el.nativeElement,
      'mouseleave',
      () => this.hide()
    );
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  ngOnDestroy(): void {
    this.hide();
    if (this.showListener) this.showListener();
    if (this.hideListener) this.hideListener();
  }

  private show(): void {
    if (!this.tooltipText || this.tooltipEl) return;

    this.tooltipEl = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipEl, text);

    this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '50');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'padding', '4px 8px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'line-height', '1');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipEl, 'background', 'var(--foreground)');
    this.renderer.setStyle(this.tooltipEl, 'color', 'var(--background)');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipEl, 'animation', 'tooltipFadeIn 0.15s ease-out');

    switch (this.tooltipSide) {
      case 'right':
        this.renderer.setStyle(this.tooltipEl, 'left', 'calc(100% + 8px)');
        this.renderer.setStyle(this.tooltipEl, 'top', '50%');
        this.renderer.setStyle(this.tooltipEl, 'transform', 'translateY(-50%)');
        break;
      case 'top':
        this.renderer.setStyle(this.tooltipEl, 'bottom', 'calc(100% + 8px)');
        this.renderer.setStyle(this.tooltipEl, 'left', '50%');
        this.renderer.setStyle(this.tooltipEl, 'transform', 'translateX(-50%)');
        break;
      case 'bottom':
        this.renderer.setStyle(this.tooltipEl, 'top', 'calc(100% + 8px)');
        this.renderer.setStyle(this.tooltipEl, 'left', '50%');
        this.renderer.setStyle(this.tooltipEl, 'transform', 'translateX(-50%)');
        break;
      case 'left':
        this.renderer.setStyle(this.tooltipEl, 'right', 'calc(100% + 8px)');
        this.renderer.setStyle(this.tooltipEl, 'top', '50%');
        this.renderer.setStyle(this.tooltipEl, 'transform', 'translateY(-50%)');
        break;
    }

    this.renderer.appendChild(this.el.nativeElement, this.tooltipEl);
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
