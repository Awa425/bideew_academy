declare namespace google {
  namespace accounts.id {
    interface IdConfiguration {
      client_id: string;
      callback: (response: {
        credential: string;
        select_by: string;
        client_id: string;
      }) => void;
      context?: string;
      ux_mode?: 'popup' | 'redirect';
      auto_select?: boolean;
      itp_support?: boolean;
    }

    interface GsiButtonConfiguration {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'small' | 'medium' | 'large';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: string | number;
      locale?: string;
    }

    function initialize(config: IdConfiguration): void;
    function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
    function prompt(): void;
  }
}

declare const google: {
  accounts: {
    id: typeof google.accounts.id;
  };
};
