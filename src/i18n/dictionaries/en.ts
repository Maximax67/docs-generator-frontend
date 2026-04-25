export const en = {
  common: {
    loading: 'Loading...',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    delete: 'Delete',
    deleting: 'Deleting...',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    add: 'Add',
    refresh: 'Refresh',
    open: 'Open',
    creating: 'Creating...',
    confirm: 'Confirm',
    total: 'Total:',
    perPage: 'Items per page:',
    tryAgain: 'Try again',
    error: 'An error occurred',
    noData: 'No data',
    unnamed: 'Unnamed',
    actions: 'Actions',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    yes: 'Yes',
    no: 'No',
  },

  nav: {
    documents: 'Documents',
    faq: 'FAQ',
    generations: 'Generations',
    users: 'Users',
    profile: 'Profile',
    signIn: 'Sign In',
    menu: 'Menu',
    toggleTheme: 'Toggle theme',
  },

  home: {
    tagline: 'Generate documents quickly and easily in just a few clicks',
    goToDocuments: 'Go to Documents',
    viewFaq: 'View FAQ',
    api: {
      title: 'Our API',
      description:
        'Use REST-API for automatic PDF document generation in your application. Documentation is available via the links below.',
    },
    tos: 'Terms of Service',
    privacy: 'Privacy Policy',
  },

  features: [
    {
      title: 'Document Creation',
      desc: 'Choose a template and get a ready PDF in minutes',
    },
    {
      title: 'Personalization',
      desc: 'Save field settings and manage your data',
    },
    {
      title: 'Help & FAQ',
      desc: 'All answers to your questions in one place',
    },
    {
      title: 'Data Security',
      desc: 'Generated documents are not stored on our servers',
    },
  ],

  timeline: {
    title: 'How to Create a Document',
    steps: [
      {
        title: 'Choose a Document',
        description: 'Choose the required template from available ones',
      },
      {
        title: 'View Preview',
        description: 'Preview the pre-filled document',
      },
      {
        title: 'Fill in Data',
        description: 'Carefully fill in all fields in the document',
      },
      {
        title: 'Review Result',
        description: 'Check the generated document for errors',
      },
      {
        title: 'Download PDF',
        description: 'Download or print the document',
      },
    ],
  },

  auth: {
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    invalidEmail: 'Invalid email address',
    invalidPassword: 'Password must be 8–32 characters',
    invalidFirstName: 'Invalid first name',
    invalidLastName: 'Invalid last name',

    login: {
      title: 'Sign In',
      subtitle: 'Welcome back. Enter your credentials to continue',
      submit: 'Sign In',
      error: 'Login error',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      register: 'Register',
    },

    register: {
      title: 'Register',
      subtitle: 'Create an account to start using the service',
      submit: 'Register',
      error: 'Registration error',
      agreeToTerms: 'I agree to the',
      termsOfService: 'terms of service',
      and: 'and',
      privacyPolicy: 'privacy policy',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In',
    },

    resetPassword: {
      title: 'Password Recovery',
      subtitleRequest: 'Enter your email and we will send a recovery link',
      subtitleChange: 'Enter a new password for your account',
      newPassword: 'New Password',
      submit: 'Change Password',
      sendLink: 'Send Link',
      success: 'Password changed successfully',
      emailSent: 'If the address exists, the email has been sent',
      backToSignIn: 'Back to Sign In',
    },

    verifyEmail: {
      title: 'Email Verification',
      missingToken: 'Missing verification token',
      success: 'Email verified',
      invalidToken: 'Invalid or expired verification token',
      verifying: 'Verifying token...',
      redirectingIn: 'Redirecting in',
      seconds: 's.',
      goNow: 'Go now',
      waiting: 'Waiting...',
    },

    logout: {
      loading: 'Signing out...',
    },
  },

  documents: {
    signInToSave: 'Sign in to save entered values',
    verifyEmailToSave: 'Verify your email to save entered values',
    noFoldersOrDocuments: 'No folders or documents',
    selectDocument: 'Select a document to view',
    updated: 'Updated:',
    select: 'Select',
    loadingPreview: 'Loading preview...',
    previewUnavailable: 'Unable to load preview',
    documentNotFound: 'Document not found',
    documentNotSelected: 'No document selected!',
    loadError: 'Failed to load document data',
    generating: 'Generating...',
    generatePdf: 'Generate PDF',
    generateDocx: 'Generate DOCX',
    noFields: 'The document has no fields to fill!',
    globalScope: 'Global scope',
    folder: 'Folder',
    loadingScope: 'Loading...',
    loadScopeError: 'Load error',
    resultNotFound: 'Generated PDF not found',

    drive: {
      dialogTitle: 'Open Google Drive Folder',
      description: 'Enter Google Drive folder URL or folder ID',
      placeholder: 'https://drive.google.com/drive/folders/... or 1a2b3c4d...',
      label: 'Folder URL or ID',
      invalidFormat: 'Invalid format. Enter a folder ID or Google Drive URL',
      noAccess: 'You do not have access to this folder',
      loadError: 'Failed to load folder',
      createAccessTitle: 'Create Access Settings',
      createAccessInfo:
        'Folder access is not configured. Set it up to allow users to view this section.',
      createAndOpen: 'Create and open',
    },

    settings: {
      validation: 'Validation',
      constants: 'Constants',
      saving: 'Save Values',
      order: 'Field Order',
      access: 'Access',
      unsavedChanges: 'Unsaved changes',
      saveChanges: 'Save changes',
      noChanges: 'No changes to save',
      close: 'Close',
      parentValidation: 'Validation from parent scopes',
      globalAccessWarning:
        'Access cannot be configured for the global scope, only for folders and files!',
      schemaSaved: 'Schema saved successfully',
      schemaError: 'Failed to save schema',
      orderSaved: 'Field order saved successfully',
      orderError: 'Failed to save field order',
      accessSaved: 'Access settings saved successfully',
      accessError: 'Failed to save access settings',
      accessDeleted: 'Access settings deleted successfully',
      accessDeleteError: 'Failed to delete access settings',
      loadSchemaError: 'Failed to load schema',
      loadAccessError: 'Failed to load access settings',
    },

    constants: {
      title: 'Constants',
      addButton: 'Add constant',
      noData: 'No constants defined',
      variableCol: 'Variable',
      typeCol: 'Type',
      valueCol: 'Value',
      scopeCol: 'Scope',
      actionsCol: 'Actions',
      addTitle: 'Add Constant',
      editTitle: 'Edit Constant',
      variableName: 'Variable name',
      typeLabel: 'Type',
      text: 'Text',
      number: 'Number',
      boolean: 'Boolean',
      json: 'JSON',
      boolTrue: 'Yes',
      boolFalse: 'No',
      jsonValue: 'JSON value',
      textValue: 'Value',
      numberValue: 'Value',
      addConfirm: 'Add',
      saveConfirm: 'Save',
      createdSuccess: 'Constant created successfully',
      updatedSuccess: 'Constant updated successfully',
      clearTitle: 'Clear Value',
      clearMessage:
        'Are you sure you want to clear the constant value? The variable will remain in the "Save Values" section.',
      deleteTitle: 'Delete Variable',
      deleteMessage: 'Are you sure you want to delete this variable?',
      deletedSuccess: 'Variable deleted successfully',
      clearedSuccess: 'Constant value cleared successfully',
      emptyName: 'Variable name cannot be empty',
      parentScopeWarning: 'You are editing a constant from a parent scope.',
      overrideConstantWarning:
        'This variable is already defined in "Validation". Are you sure you want to make it a constant?',
      overrideParentWarning:
        'This variable already exists in a parent scope. Are you sure you want to override it?',
      overrideParentConstantWarning:
        'This variable is already defined as a constant in a parent scope and will be overridden.',
    },

    savingVars: {
      title: 'Save Values',
      addButton: 'Add variable',
      noData: 'No variables to save',
      variableCol: 'Variable',
      scopeCol: 'Scope',
      allowSaveCol: 'Allow saving',
      actionsCol: 'Actions',
      addTitle: 'Add variable for saving',
      variableName: 'Variable name',
      addConfirm: 'Add',
      createdSuccess: 'Save variable created successfully',
      deleteTitle: 'Delete Variable',
      deleteMessage: 'Are you sure you want to delete the variable "{name}"?',
      deleteWithSchemaMessage:
        'Are you sure you want to delete the variable "{name}"? This variable has a validation schema. Deleting it will also remove the validation schema.',
      deletedSuccess: 'Variable deleted successfully',
      emptyName: 'Variable name cannot be empty',
      duplicateInScope: 'A variable with this name already exists in this scope.',
      constantInScope: 'This variable is a constant in the current scope.',
      constantParentWarning:
        'This variable is a constant in a parent scope. Adding a savable variable will override it for the current scope.',
    },

    fieldOrder: {
      title: 'Field Order',
      noData: 'No fields to sort.',
    },

    access: {
      title: 'Access Settings',
      accessLevel: 'Access Level',
      accessLevelHelp: 'Who can view this section and its content',
      allUsers: 'All users',
      authenticated: 'Authenticated users',
      verified: 'Verified email',
      adminsOnly: 'Administrators',
      unlimitedDepth: 'Unlimited depth',
      unlimitedDepthHelp: 'If enabled, access extends to all nested items',
      maxDepth: 'Maximum depth',
      maxDepthHelp: '1 = only files in this folder',
      pinned: 'Pin to root tree',
      pinnedHelp: 'Show this item in the root document tree',
      noAccess: 'Access is not configured. Using parent scope access.',
      addAccess: 'Add access',
      deleteAccess: 'Delete access',
      cancelAccess: 'Cancel',
    },

    unsavedDialog: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave without saving?',
      confirm: 'Leave without saving',
      cancel: 'Stay',
    },

    generation: {
      success: 'Document generated successfully!',
      readyToDownload: 'Your file is ready to download',
      download: 'Download',
      preview: 'Preview',
      close: 'Close',
    },

    saveVariables: {
      title: 'Save values?',
      description:
        'Select variables whose values you want to save for future generations.',
      variableCol: 'Variable',
      currentValueCol: 'Current value',
      was: 'Was:',
      notSaved: 'Not yet saved',
      skip: 'Skip',
      save: 'Save ({count})',
      savedSuccess: 'Changes saved successfully',
      saveError: 'Failed to save changes',
    },
  },

  generations: {
    title: 'Generations',
    noData: 'No generated documents',
    templateCol: 'Template',
    userCol: 'User',
    roleCol: 'Role',
    dateCol: 'Generation date',
    variablesCol: 'Variables',
    actionsCol: 'Actions',
    unauthorized: 'Unauthorized',
    openTemplate: 'Open template',
    regenerate: 'Regenerate',
    regenerateOld: 'Regenerate with old values',
    delete: 'Delete',
    showVariables: 'Show variables',
    hideVariables: 'Hide variables',
    deleteError: 'Failed to delete PDF',
    regenerateError: 'Failed to regenerate PDF',
    adminOnly: 'This page is only available to moderators',
    notAuthorized: 'You are not authorized',
    loadError: 'Failed to load generations',
  },

  profile: {
    notAuthorized: 'You are not authorized',
    adminOnly: 'Only a moderator can view other profiles',
    notFound: 'User not found',

    tabs: {
      info: 'Information',
      generations: 'Generations',
      vars: 'Saved Data',
      sessions: 'Sessions',
      logout: 'Sign Out',
    },

    info: {
      title: 'Account',
      emailLabel: 'Email',
      nameLabel: 'Full Name',
      securityLabel: 'Security',
      active: 'Active',
      banned: 'Banned',
      emailVerified: 'Email verified',
      emailNotVerified: 'Email not verified',
      sendConfirmation: 'Send confirmation',
      confirmEmail: 'Confirm',
      revokeConfirmation: 'Revoke confirmation',
      changeEmail: 'Change Email',
      editName: 'Edit Name',
      changePassword: 'Change Password',
      block: 'Block',
      unblock: 'Unblock',
      makeUser: 'Make User',
      makeAdmin: 'Make Admin',
      deleteUser: 'Delete',
    },

    generations: {
      title: 'Generations',
      deleteAll: 'Delete All',
      noData: 'No generated documents',
      templateCol: 'Template',
      dateCol: 'Generation date',
      variablesCol: 'Variables',
      actionsCol: 'Actions',
      showVars: 'Show variables',
      hideVars: 'Hide variables',
    },

    vars: {
      title: 'Saved Data',
      clearAll: 'Clear all',
      noData: 'No saved data',
      variableCol: 'Variable',
      typeCol: 'Type',
      valueCol: 'Value',
      scopeCol: 'Scope',
      actionsCol: 'Actions',
      editTitle: 'Edit variable',
      editPlaceholder: 'Enter value (text, number, true/false or JSON)',
    },

    sessions: {
      title: 'Sessions',
      logoutAll: 'Sign out of all sessions',
      noData: 'No sessions found',
      nameCol: 'Name',
      createdCol: 'Created',
      updatedCol: 'Updated',
      actionsCol: 'Actions',
      endButton: 'End',
      currentBadge: 'Current',
    },

    logout: {
      title: 'Sign Out',
      signOut: 'Sign Out',
      signOutAll: 'Sign out of all sessions',
      deleteAccount: 'Delete Account',
    },

    dialogs: {
      changeEmail: {
        title: 'Change Email',
        newEmail: 'New email',
        invalidEmail: 'Invalid email address',
        save: 'Save',
        cancel: 'Cancel',
      },
      changePassword: {
        title: 'Change Password',
        oldPassword: 'Old password',
        newPassword: 'New password',
        invalidPassword: 'Password must be 8–32 characters',
        save: 'Save',
        cancel: 'Cancel',
      },
      editNames: {
        title: 'Update Name',
        firstName: 'First Name',
        lastName: 'Last Name',
        invalidFirstName: 'Invalid first name',
        invalidLastName: 'Invalid last name',
        save: 'Save',
        cancel: 'Cancel',
      },
      deleteAccount: {
        title: 'Confirm Account Deletion',
        description: 'To delete, enter',
        confirmButton: 'Delete',
        cancelButton: 'Cancel',
      },
    },

    confirmations: {
      endSession: {
        title: 'End Session',
        message: 'Are you sure you want to end this session?',
        currentMessage: 'Are you sure you want to end the current session?',
        confirm: 'End',
        cancel: 'Cancel',
      },
      logoutAll: {
        title: 'Sign Out of All Sessions',
        message:
          'Are you sure you want to sign out of all active sessions? You will need to sign in again on all devices.',
        confirm: 'Sign out of all',
        cancel: 'Cancel',
      },
      clearData: {
        title: 'Clear All Data',
        message:
          'Are you sure you want to delete all saved data? This action cannot be undone.',
        confirm: 'Clear',
        cancel: 'Cancel',
      },
      deleteVar: {
        title: 'Delete Variable',
        message: 'Are you sure you want to delete this variable?',
        confirm: 'Delete',
        cancel: 'Cancel',
      },
      deleteGeneration: {
        title: 'Delete Generation',
        message: 'Are you sure you want to delete this generation?',
        confirm: 'Delete',
        cancel: 'Cancel',
      },
      deleteAllGenerations: {
        title: 'Delete All Generations',
        message:
          'Are you sure you want to delete all generations? This action cannot be undone.',
        confirm: 'Delete all',
        cancel: 'Cancel',
      },
      deleteAccount: {
        title: 'Delete Account',
        message:
          'Are you sure you want to permanently delete your account? This action cannot be undone.',
        confirm: 'Delete',
        cancel: 'Cancel',
      },
    },
  },

  users: {
    title: 'Users',
    allRoles: 'All roles',
    allStatuses: 'All statuses',
    active: 'Active',
    banned: 'Banned',
    fullNameCol: 'Full Name',
    emailCol: 'Email',
    registrationCol: 'Registration date',
    roleCol: 'Role',
    statusCol: 'Status',
    actionsCol: 'Actions',
    viewProfile: 'View profile',
    notAuthorized: 'You are not authorized',
    adminOnly: 'This page is for administrators only',
    loadError: 'Failed to load users',
    searchPlaceholder: 'Search by name or email',
  },

  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'How do I create a new document?',
        a: "Go to the 'Documents' section, choose the desired template from the list and click on it. Fill in all the required fields and click the generate button. You will receive a ready PDF or DOCX document.",
      },
      {
        q: 'Can I save field values for later use?',
        a: 'Yes, if you are registered and have confirmed your email, you can save field values. They will be automatically filled in when creating new documents.',
      },
      {
        q: 'How do I verify my email?',
        a: 'After registration, you will receive an email with a verification link. Follow it to activate your account. If the email did not arrive, you can request a resend in your profile settings.',
      },
      {
        q: 'What document formats are supported?',
        a: 'The system generates documents only in PDF and DOCX formats.',
      },
      {
        q: 'What should I do if I forgot my password?',
        a: "On the login page, click 'Forgot password?'. Enter your email and we will send you instructions on how to recover access to your account.",
      },
      {
        q: 'Can the system be used without registration?',
        a: 'Yes, you can generate documents without registration, but field value saving and generation history will not be available. We recommend registering for full functionality.',
      },
      {
        q: 'Are there any limits on the number of documents?',
        a: 'There are no limits, however we apply rate limiting to keep the system stable for everyone.',
      },
      {
        q: 'What should I do if a document was generated incorrectly?',
        a: 'Check that all fields were filled in correctly. If the problem persists, you can use the feedback bot @fice_robot — we will help quickly.',
      },
      {
        q: 'How do I get help if something is not working?',
        a: 'Contact us through the Telegram feedback bot @fice_robot.',
      },
    ],
  },

  rateLimit: {
    title: 'Too Many Requests',
    description: 'Please wait a moment and try again.',
    retryIn: 'You can retry in',
    seconds: 's.',
    close: 'Close',
  },

  pwa: {
    installPrompt: 'Install app?',
    install: 'Install',
  },

  confirmDialog: {
    defaultTitle: 'Confirm',
    defaultConfirm: 'Confirm',
    cancel: 'Cancel',
  },

  scope: {
    global: 'Global',
  },

  fullValueDialog: {
    title: 'Variable value',
    close: 'Close',
  },

  roles: {
    user: 'User',
    admin: 'Admin',
    god: 'God',
  },
};

export type Dictionary = typeof en;
