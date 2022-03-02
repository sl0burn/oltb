import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import StateManager from '../core/Managers/StateManager';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { toolButtonsTippySingleton } from '../core/ToolbarTooltips';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { isHorizontal } from '../helpers/IsRowDirection';

class DirectionToggle extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        this.horizontalIcon = getIcon({
            path: SVGPaths.DirectionHorizontal,
            class: 'oltb-tool-button__icon'
        });

        this.verticalIcon = getIcon({
            path: SVGPaths.DirectionVertical,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', isHorizontal() ? 'Vertical toolbar' : 'Horizontal toolbar' + ' (D)');
        button.className = 'oltb-tool-button';
        button.innerHTML = isHorizontal() ? this.verticalIcon : this.horizontalIcon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.callbacksObj = callbacksObj;

        this.button = button;
        this.active = false;
        
        this.isSmallDevice();

        window.addEventListener('resize', this.isSmallDevice.bind(this));
        window.addEventListener('oltb.settings.cleared', this.clearDirection.bind(this));

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'd')) {
                this.handleClick(event);
            }
        });
    }

    isSmallDevice(event) {
        if(window.innerWidth <= 576) {
            this.button.classList.add('oltb-tool-button--hidden');
        }else {
            this.button.classList.remove('oltb-tool-button--hidden');
        }
    }

    handleClick(event) {
        event.preventDefault();
        this.handleDirectionToggle();
    }

    clearDirection() {
        StateManager.updateStateObject('direction', 'oltb-col');
        toolbarElement.classList.remove('row');
        document.body.classList.remove('oltb-row');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.horizontalIcon);
        this.button._tippy.setContent('Horizontal toolbar (D)');
        toolButtonsTippySingleton.setProps({placement: 'right'});
    }

    handleDirectionToggle() {
        let direction = 'col';
        let tooltipDirection = 'right';

        if(isHorizontal()) {
            this.clearDirection();
        }else {
            direction = 'row';
            tooltipDirection = 'bottom';

            StateManager.updateStateObject('direction', 'oltb-row');
            toolbarElement.classList.add('row');
            document.body.classList.add('oltb-row');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.verticalIcon);
            this.button._tippy.setContent('Vertical  toolbar (D)');
            toolButtonsTippySingleton.setProps({placement: 'bottom'});
        }

        // This will trigger collision detection for the toolbar vs toolbox
        // window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new CustomEvent('oltb.toolbar.direction.change', {
            detail: {
                direction: tooltipDirection
            }
        }));

        // User defined callback from constructor
        if(typeof this.callbacksObj.changed === 'function') {
            this.callbacksObj.changed(direction);
        }
    }
}

export default DirectionToggle;