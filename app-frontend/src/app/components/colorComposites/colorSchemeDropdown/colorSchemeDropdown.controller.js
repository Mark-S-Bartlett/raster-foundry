/* global _ */

const STATES = ['MAIN', 'SCHEME', 'BLENDING'];
const MIN_BINS = 2;
const MAX_BINS = 12;
const ELASTIC_NAV = true;

export default class ColorSchemeDropdownController {
    constructor($scope, $element, colorSchemeService) {
        'ngInject';
        this.$scope = $scope;
        this.$element = $element;
        this.colorSchemeService = colorSchemeService;
        this.bins = [0, ...[ ...Array(1 + MAX_BINS - MIN_BINS).keys()].map(b => b + MIN_BINS)];
    }

    $onInit() {
        this.$element.on('wheel', (event) => {
            event.stopPropagation();
        });
    }

    $onChanges() {
        this.deserializeColorSchemeOptions();
        this.mergeStates();
    }

    deserializeColorSchemeOptions() {
        this._colorSchemeOptions = angular.fromJson(this.colorSchemeOptions);
    }

    mergeStates() {
        this.state = Object.assign(
            {},
            this.getInitialState(),
            this.getStateFromColorSchemeOptions()
        );
    }

    getInitialState() {
        return {
            view: 'MAIN',
            blending: {
                label: this.getBlendingLabel(0),
                bins: 0
            },
            schemeType: {
                label: 'Sequential',
                value: 'SEQUENTIAL'
            },
            scheme: this.colorSchemeService.defaultColorSchemes.find(s => s.type === 'SEQUENTIAL')
        };
    }

    getStateFromColorSchemeOptions() {
        let stateToReturn = {};
        if (this._colorSchemeOptions && this._colorSchemeOptions.colorScheme) {
            const scheme = this.colorSchemeService.defaultColorSchemes.find(
                s => _.isEqual(
                    this._colorSchemeOptions.colorScheme,
                    s.colors
                )
            );

            if (scheme) {
                stateToReturn.scheme = scheme;
            }

            if (this._colorSchemeOptions.dataType) {
                stateToReturn.schemeType = this.colorSchemeService.defaultColorSchemeTypes.find(
                    t => this._colorSchemeOptions.dataType === t.value
                );
            }

            let blending = {
                label: this.getBlendingLabel(0),
                bins: 0
            };

            if (Array.isArray(this._colorSchemeOptions.colorScheme)) {
                blending = {
                    label: this.getBlendingLabel(0),
                    bins: 0
                };
            } else {
                let bins = Object.keys(this._colorSchemeOptions.colorScheme).length;
                blending = {
                    label: this.getBlendingLabel(bins),
                    bins
                };
            }
            stateToReturn[blending] = blending;
        }
        return stateToReturn;
    }

    getColorSchemeOptionsFromState() {
        // @TODO: need to determine way forward for setting bin values?
        if (this.state) {
            return {
                colorScheme: this.state.scheme.colors,
                dataType: this.state.schemeType.value,
                colorBins: this.state.blending.bins
            };
        }
        return {};
    }

    moveToView(view) {
        if (STATES.includes(view)) {
            this.state = Object.assign(
                {},
                this.state,
                {
                    view: view
                }
            );
        }
    }

    setSchemeType(schemeType) {
        this.state = Object.assign(
            {},
            this.state,
            { schemeType }
        );
        if (ELASTIC_NAV) {
            this.moveToView('MAIN');
        }
        this.reflectState();
    }

    setBlending(bins) {
        this.state = Object.assign(
            {},
            this.state,
            {
                blending: {
                    label: this.getBlendingLabel(bins),
                    bins
                }
            }
        );
        if (ELASTIC_NAV) {
            this.moveToView('MAIN');
        }
        this.reflectState();
    }

    setScheme(scheme) {
        this.state = Object.assign(
            {},
            this.state,
            { scheme }
        );
        this.reflectState();
    }

    reflectState() {
        if (this.onChange) {
            this.onChange({
                value: this.getColorSchemeOptionsFromState()
            });
        }
    }

    getSchemeClass(scheme) {
        if (this.state) {
            return {
                'selected': _.isEqual(
                                this.state.scheme.colors,
                                scheme.colors
                            )
            };
        }
        return {};
    }

    getSchemeTypeClass(schemeType) {
        return {
            'selected': this.isActiveSchemeType(schemeType)
        };
    }

    getBlendingClass(bin) {
        if (this.state) {
            return {
                'selected': this.state.blending.bins === bin
            };
        }
        return {};
    }

    getBlendingLabel(bin) {
        if (bin === 0) {
            return 'Continuous';
        }
        return `${bin} discrete bins`;
    }

    isActiveSchemeType(schemeType) {
        if (this.state) {
            return this.state.schemeType.value === schemeType.value;
        }
        return false;
    }

    shouldShowView(view) {
        if (this.state) {
            return this.state.view === view;
        }
        return false;
    }
}