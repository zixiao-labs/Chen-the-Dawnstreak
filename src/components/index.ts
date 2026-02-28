import { createComponent } from './create-component.js';
export { createComponent, type CommonProps } from './create-component.js';

// ─── Side-effect imports: register all MDUI custom elements (browser-only) ──
if (typeof window !== 'undefined') {
  import('./register.js');
}

// ─── Shared types ───────────────────────────────────────────────────────────

type TargetAttr = '_blank' | '_parent' | '_self' | '_top';
type RelAttr =
  | 'alternate' | 'author' | 'bookmark' | 'external' | 'help'
  | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer'
  | 'opener' | 'prev' | 'search' | 'tag';
type ButtonType = 'submit' | 'reset' | 'button';
type FormEnctype = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
type FormMethod = 'post' | 'get';
type EventHandler = (event: Event) => void;
const selfTarget = (e: Event, el: HTMLElement) => e.target === el;

// ─── 1. Avatar ──────────────────────────────────────────────────────────────

export interface AvatarProps {
  src?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  icon?: string;
  label?: string;
}

export const Avatar = createComponent<AvatarProps>('mdui-avatar');

// ─── 2. Badge ───────────────────────────────────────────────────────────────

export interface BadgeProps {
  variant?: 'small' | 'large';
}

export const Badge = createComponent<BadgeProps>('mdui-badge');

// ─── 3. BottomAppBar ────────────────────────────────────────────────────────

export interface BottomAppBarProps {
  hide?: boolean;
  fabDetach?: boolean;
  scrollBehavior?: 'hide' | 'shrink' | 'elevate';
  scrollTarget?: string;
  scrollThreshold?: number;
  order?: number;
}

export const BottomAppBar = createComponent<BottomAppBarProps>('mdui-bottom-app-bar');

// ─── 4. Button ──────────────────────────────────────────────────────────────

export interface ButtonProps {
  variant?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
  fullWidth?: boolean;
  icon?: string;
  endIcon?: string;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  type?: ButtonType;
  form?: string;
  formAction?: string;
  formEnctype?: FormEnctype;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: TargetAttr;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onInvalid?: EventHandler;
}

export const Button = createComponent<ButtonProps>('mdui-button', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
  onInvalid: 'invalid',
});

// ─── 5. ButtonIcon ──────────────────────────────────────────────────────────

export interface ButtonIconProps {
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
  icon?: string;
  selectedIcon?: string;
  selectable?: boolean;
  selected?: boolean;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  type?: ButtonType;
  form?: string;
  formAction?: string;
  formEnctype?: FormEnctype;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: TargetAttr;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInvalid?: EventHandler;
}

export const ButtonIcon = createComponent<ButtonIconProps>('mdui-button-icon', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInvalid: 'invalid',
});

// ─── 6. Card ────────────────────────────────────────────────────────────────

export interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  clickable?: boolean;
  disabled?: boolean;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
}

export const Card = createComponent<CardProps>('mdui-card', {
  onClick: 'click',
});

// ─── 7. Checkbox ────────────────────────────────────────────────────────────

export interface CheckboxProps {
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  required?: boolean;
  form?: string;
  name?: string;
  value?: string;
  uncheckedIcon?: string;
  checkedIcon?: string;
  indeterminateIcon?: string;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
}

export const Checkbox = createComponent<CheckboxProps>('mdui-checkbox', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
});

// ─── 8. Chip ────────────────────────────────────────────────────────────────

export interface ChipProps {
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';
  elevated?: boolean;
  selectable?: boolean;
  selected?: boolean;
  deletable?: boolean;
  icon?: string;
  selectedIcon?: string;
  endIcon?: string;
  deleteIcon?: string;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  type?: ButtonType;
  form?: string;
  formAction?: string;
  formEnctype?: FormEnctype;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: TargetAttr;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onInvalid?: EventHandler;
  onChange?: EventHandler;
  onDelete?: EventHandler;
}

export const Chip = createComponent<ChipProps>('mdui-chip', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
  onInvalid: 'invalid',
  onChange: 'change',
  onDelete: 'delete',
});

// ─── 9. CircularProgress ────────────────────────────────────────────────────

export interface CircularProgressProps {
  max?: number;
  value?: number;
}

export const CircularProgress = createComponent<CircularProgressProps>('mdui-circular-progress');

// ─── 10. Collapse ───────────────────────────────────────────────────────────

export interface CollapseProps {
  accordion?: boolean;
  value?: string | string[];
  disabled?: boolean;
  onChange?: EventHandler;
}

export const Collapse = createComponent<CollapseProps>('mdui-collapse', {
  onChange: 'change',
});

// ─── 11. CollapseItem ───────────────────────────────────────────────────────

export interface CollapseItemProps {
  value?: string;
  header?: string;
  disabled?: boolean;
  trigger?: string;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
}

export const CollapseItem = createComponent<CollapseItemProps>('mdui-collapse-item', {
  onOpen: 'open',
  onOpened: 'opened',
  onClose: 'close',
  onClosed: 'closed',
});

// ─── 12. Dialog ─────────────────────────────────────────────────────────────

export interface DialogProps {
  icon?: string;
  headline?: string;
  description?: string;
  open?: boolean;
  fullscreen?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  stackedActions?: boolean;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
  onOverlayClick?: EventHandler;
}

export const Dialog = createComponent<DialogProps>('mdui-dialog', {
  onOpen: { event: 'open', filter: selfTarget },
  onOpened: { event: 'opened', filter: selfTarget },
  onClose: { event: 'close', filter: selfTarget },
  onClosed: { event: 'closed', filter: selfTarget },
  onOverlayClick: 'overlay-click',
});

// ─── 13. Divider ────────────────────────────────────────────────────────────

export interface DividerProps {
  vertical?: boolean;
  inset?: boolean;
  middle?: boolean;
}

export const Divider = createComponent<DividerProps>('mdui-divider');

// ─── 14. Dropdown ───────────────────────────────────────────────────────────

export interface DropdownProps {
  open?: boolean;
  disabled?: boolean;
  trigger?: 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual' | string;
  placement?:
    | 'auto' | 'top-start' | 'top' | 'top-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'
    | 'left-start' | 'left' | 'left-end'
    | 'right-start' | 'right' | 'right-end';
  stayOpenOnClick?: boolean;
  openDelay?: number;
  closeDelay?: number;
  openOnPointer?: boolean;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
}

export const Dropdown = createComponent<DropdownProps>('mdui-dropdown', {
  onOpen: 'open',
  onOpened: 'opened',
  onClose: 'close',
  onClosed: 'closed',
});

// ─── 15. Fab ────────────────────────────────────────────────────────────────

export interface FabProps {
  variant?: 'primary' | 'surface' | 'secondary' | 'tertiary';
  size?: 'normal' | 'small' | 'large';
  icon?: string;
  extended?: boolean;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  type?: ButtonType;
  form?: string;
  formAction?: string;
  formEnctype?: FormEnctype;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: TargetAttr;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onInvalid?: EventHandler;
}

export const Fab = createComponent<FabProps>('mdui-fab', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
  onInvalid: 'invalid',
});

// ─── 16. Icon ───────────────────────────────────────────────────────────────

export interface IconProps {
  name?: string;
  src?: string;
}

export const Icon = createComponent<IconProps>('mdui-icon');

// ─── 17. Layout ─────────────────────────────────────────────────────────────

export interface LayoutProps {
  fullHeight?: boolean;
}

export const Layout = createComponent<LayoutProps>('mdui-layout');

// ─── 18. LayoutItem ─────────────────────────────────────────────────────────

export interface LayoutItemProps {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  order?: number;
}

export const LayoutItem = createComponent<LayoutItemProps>('mdui-layout-item');

// ─── 19. LayoutMain ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LayoutMainProps {}

export const LayoutMain = createComponent<LayoutMainProps>('mdui-layout-main');

// ─── 20. LinearProgress ─────────────────────────────────────────────────────

export interface LinearProgressProps {
  max?: number;
  value?: number;
}

export const LinearProgress = createComponent<LinearProgressProps>('mdui-linear-progress');

// ─── 21. List ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListProps {}

export const List = createComponent<ListProps>('mdui-list');

// ─── 22. ListItem ───────────────────────────────────────────────────────────

export interface ListItemProps {
  headline?: string;
  headlineLine?: 1 | 2 | 3;
  description?: string;
  descriptionLine?: 1 | 2 | 3;
  icon?: string;
  endIcon?: string;
  disabled?: boolean;
  active?: boolean;
  nonclickable?: boolean;
  rounded?: boolean;
  alignment?: 'start' | 'center' | 'end';
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

export const ListItem = createComponent<ListItemProps>('mdui-list-item', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
});

// ─── 23. ListSubheader ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListSubheaderProps {}

export const ListSubheader = createComponent<ListSubheaderProps>('mdui-list-subheader');

// ─── 24. Menu ───────────────────────────────────────────────────────────────

export interface MenuProps {
  selects?: 'single' | 'multiple';
  value?: string | string[];
  dense?: boolean;
  submenuTrigger?: 'click' | 'hover' | 'focus' | 'manual' | string;
  submenuOpenDelay?: number;
  submenuCloseDelay?: number;
  onChange?: EventHandler;
}

export const Menu = createComponent<MenuProps>('mdui-menu', {
  onChange: 'change',
});

// ─── 25. MenuItem ───────────────────────────────────────────────────────────

export interface MenuItemProps {
  value?: string;
  disabled?: boolean;
  icon?: string;
  endIcon?: string;
  endText?: string;
  selectedIcon?: string;
  submenuOpen?: boolean;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onSubmenuOpen?: EventHandler;
  onSubmenuOpened?: EventHandler;
  onSubmenuClose?: EventHandler;
  onSubmenuClosed?: EventHandler;
}

export const MenuItem = createComponent<MenuItemProps>('mdui-menu-item', {
  onFocus: 'focus',
  onBlur: 'blur',
  onSubmenuOpen: 'submenu-open',
  onSubmenuOpened: 'submenu-opened',
  onSubmenuClose: 'submenu-close',
  onSubmenuClosed: 'submenu-closed',
});

// ─── 26. NavigationBar ──────────────────────────────────────────────────────

export interface NavigationBarProps {
  hide?: boolean;
  labelVisibility?: 'auto' | 'selected' | 'labeled' | 'unlabeled';
  value?: string;
  scrollBehavior?: 'hide' | 'shrink' | 'elevate';
  scrollTarget?: string;
  scrollThreshold?: number;
  order?: number;
  onChange?: EventHandler;
  onShow?: EventHandler;
  onShown?: EventHandler;
  onHide?: EventHandler;
  onHidden?: EventHandler;
}

export const NavigationBar = createComponent<NavigationBarProps>('mdui-navigation-bar', {
  onChange: 'change',
  onShow: 'show',
  onShown: 'shown',
  onHide: 'hide',
  onHidden: 'hidden',
});

// ─── 27. NavigationBarItem ──────────────────────────────────────────────────

export interface NavigationBarItemProps {
  icon?: string;
  activeIcon?: string;
  value?: string;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

export const NavigationBarItem = createComponent<NavigationBarItemProps>(
  'mdui-navigation-bar-item',
  {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur',
  },
);

// ─── 28. NavigationDrawer ───────────────────────────────────────────────────

export interface NavigationDrawerProps {
  open?: boolean;
  modal?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  placement?: 'left' | 'right';
  contained?: boolean;
  order?: number;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
  onOverlayClick?: EventHandler;
}

export const NavigationDrawer = createComponent<NavigationDrawerProps>('mdui-navigation-drawer', {
  onOpen: 'open',
  onOpened: 'opened',
  onClose: 'close',
  onClosed: 'closed',
  onOverlayClick: 'overlay-click',
});

// ─── 29. NavigationRail ─────────────────────────────────────────────────────

export interface NavigationRailProps {
  value?: string;
  placement?: 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  contained?: boolean;
  divider?: boolean;
  order?: number;
  onChange?: EventHandler;
}

export const NavigationRail = createComponent<NavigationRailProps>('mdui-navigation-rail', {
  onChange: 'change',
});

// ─── 30. NavigationRailItem ─────────────────────────────────────────────────

export interface NavigationRailItemProps {
  icon?: string;
  activeIcon?: string;
  value?: string;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

export const NavigationRailItem = createComponent<NavigationRailItemProps>(
  'mdui-navigation-rail-item',
  {
    onFocus: 'focus',
    onBlur: 'blur',
  },
);

// ─── 31. Radio ──────────────────────────────────────────────────────────────

export interface RadioProps {
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  uncheckedIcon?: string;
  checkedIcon?: string;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
}

export const Radio = createComponent<RadioProps>('mdui-radio', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
});

// ─── 32. RadioGroup ─────────────────────────────────────────────────────────

export interface RadioGroupProps {
  disabled?: boolean;
  form?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
}

export const RadioGroup = createComponent<RadioGroupProps>('mdui-radio-group', {
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
});

// ─── 33. RangeSlider ────────────────────────────────────────────────────────

export interface RangeSliderProps {
  defaultValue?: number[];
  value?: number[];
  autofocus?: boolean;
  tabIndex?: number;
  min?: number;
  max?: number;
  step?: number;
  tickmarks?: boolean;
  nolabel?: boolean;
  disabled?: boolean;
  form?: string;
  name?: string;
  labelFormatter?: (value: number) => string;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
}

export const RangeSlider = createComponent<RangeSliderProps>('mdui-range-slider', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
});

// ─── 34. SegmentedButton ────────────────────────────────────────────────────

export interface SegmentedButtonProps {
  icon?: string;
  endIcon?: string;
  selectedIcon?: string;
  href?: string;
  download?: string;
  target?: TargetAttr;
  rel?: RelAttr;
  autofocus?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  type?: ButtonType;
  form?: string;
  formAction?: string;
  formEnctype?: FormEnctype;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: TargetAttr;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onInvalid?: EventHandler;
}

export const SegmentedButton = createComponent<SegmentedButtonProps>('mdui-segmented-button', {
  onClick: 'click',
  onFocus: 'focus',
  onBlur: 'blur',
  onInvalid: 'invalid',
});

// ─── 35. SegmentedButtonGroup ───────────────────────────────────────────────

export interface SegmentedButtonGroupProps {
  fullWidth?: boolean;
  selects?: 'single' | 'multiple';
  disabled?: boolean;
  required?: boolean;
  form?: string;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: EventHandler;
  onInvalid?: EventHandler;
}

export const SegmentedButtonGroup = createComponent<SegmentedButtonGroupProps>(
  'mdui-segmented-button-group',
  {
    onChange: 'change',
    onInvalid: 'invalid',
  },
);

// ─── 36. Select ─────────────────────────────────────────────────────────────

export interface SelectProps {
  variant?: 'filled' | 'outlined';
  multiple?: boolean;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  label?: string;
  placeholder?: string;
  helper?: string;
  clearable?: boolean;
  clearIcon?: string;
  placement?: 'auto' | 'bottom' | 'top';
  endAligned?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: string;
  endIcon?: string;
  errorIcon?: string;
  form?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInvalid?: EventHandler;
  onClear?: EventHandler;
}

export const Select = createComponent<SelectProps>('mdui-select', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInvalid: 'invalid',
  onClear: 'clear',
});

// ─── 37. Slider ─────────────────────────────────────────────────────────────

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  autofocus?: boolean;
  tabIndex?: number;
  min?: number;
  max?: number;
  step?: number;
  tickmarks?: boolean;
  nolabel?: boolean;
  disabled?: boolean;
  form?: string;
  name?: string;
  labelFormatter?: (value: number) => string;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
}

export const Slider = createComponent<SliderProps>('mdui-slider', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
});

// ─── 38. Snackbar ───────────────────────────────────────────────────────────

export interface SnackbarProps {
  open?: boolean;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
  action?: string;
  actionLoading?: boolean;
  closeable?: boolean;
  closeIcon?: string;
  messageLine?: 1 | 2;
  autoCloseDelay?: number;
  closeOnOutsideClick?: boolean;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
  onActionClick?: EventHandler;
}

export const Snackbar = createComponent<SnackbarProps>('mdui-snackbar', {
  onOpen: 'open',
  onOpened: 'opened',
  onClose: 'close',
  onClosed: 'closed',
  onActionClick: 'action-click',
});

// ─── 39. Switch ─────────────────────────────────────────────────────────────

export interface SwitchProps {
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  uncheckedIcon?: string;
  checkedIcon?: string;
  required?: boolean;
  form?: string;
  name?: string;
  value?: string;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
}

export const Switch = createComponent<SwitchProps>('mdui-switch', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
});

// ─── 40. Tab ────────────────────────────────────────────────────────────────

export interface TabProps {
  value?: string;
  icon?: string;
  inline?: boolean;
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

export const Tab = createComponent<TabProps>('mdui-tab', {
  onFocus: 'focus',
  onBlur: 'blur',
});

// ─── 41. TabPanel ───────────────────────────────────────────────────────────

export interface TabPanelProps {
  value?: string;
}

export const TabPanel = createComponent<TabPanelProps>('mdui-tab-panel');

// ─── 42. Tabs ───────────────────────────────────────────────────────────────

export interface TabsProps {
  variant?: 'primary' | 'secondary';
  value?: string;
  placement?:
    | 'top-start' | 'top' | 'top-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'
    | 'left-start' | 'left' | 'left-end'
    | 'right-start' | 'right' | 'right-end';
  fullWidth?: boolean;
  onChange?: EventHandler;
}

export const Tabs = createComponent<TabsProps>('mdui-tabs', {
  onChange: 'change',
});

// ─── 43. TextField ──────────────────────────────────────────────────────────

export interface TextFieldProps {
  variant?: 'filled' | 'outlined';
  type?:
    | 'text' | 'number' | 'password' | 'url' | 'email'
    | 'search' | 'tel' | 'hidden' | 'date'
    | 'datetime-local' | 'month' | 'time' | 'week';
  name?: string;
  value?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  helperOnFocus?: boolean;
  clearable?: boolean;
  clearIcon?: string;
  endAligned?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: string;
  endIcon?: string;
  errorIcon?: string;
  form?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  minlength?: number;
  maxlength?: number;
  counter?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  togglePassword?: boolean;
  showPasswordIcon?: string;
  hidePasswordIcon?: string;
  autocapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autocorrect?: string;
  autocomplete?: string;
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  spellcheck?: boolean;
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autofocus?: boolean;
  tabIndex?: number;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
  onClear?: EventHandler;
}

export const TextField = createComponent<TextFieldProps>('mdui-text-field', {
  onFocus: 'focus',
  onBlur: 'blur',
  onChange: 'change',
  onInput: 'input',
  onInvalid: 'invalid',
  onClear: 'clear',
});

// ─── 44. Tooltip ────────────────────────────────────────────────────────────

export interface TooltipProps {
  variant?: 'plain' | 'rich';
  placement?:
    | 'auto'
    | 'top-left' | 'top-start' | 'top' | 'top-end' | 'top-right'
    | 'bottom-left' | 'bottom-start' | 'bottom' | 'bottom-end' | 'bottom-right'
    | 'left-start' | 'left' | 'left-end'
    | 'right-start' | 'right' | 'right-end';
  openDelay?: number;
  closeDelay?: number;
  headline?: string;
  content?: string;
  trigger?: 'click' | 'hover' | 'focus' | 'manual' | string;
  disabled?: boolean;
  open?: boolean;
  onOpen?: EventHandler;
  onOpened?: EventHandler;
  onClose?: EventHandler;
  onClosed?: EventHandler;
}

export const Tooltip = createComponent<TooltipProps>('mdui-tooltip', {
  onOpen: 'open',
  onOpened: 'opened',
  onClose: 'close',
  onClosed: 'closed',
});

// ─── 45. TopAppBar ──────────────────────────────────────────────────────────

export interface TopAppBarProps {
  variant?: 'center-aligned' | 'small' | 'medium' | 'large';
  hide?: boolean;
  shrink?: boolean;
  scrollBehavior?: 'hide' | 'shrink' | 'elevate';
  scrollTarget?: string;
  scrollThreshold?: number;
  order?: number;
  onShow?: EventHandler;
  onShown?: EventHandler;
  onHide?: EventHandler;
  onHidden?: EventHandler;
}

export const TopAppBar = createComponent<TopAppBarProps>('mdui-top-app-bar', {
  onShow: 'show',
  onShown: 'shown',
  onHide: 'hide',
  onHidden: 'hidden',
});

// ─── 46. TopAppBarTitle ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TopAppBarTitleProps {}

export const TopAppBarTitle = createComponent<TopAppBarTitleProps>('mdui-top-app-bar-title');
