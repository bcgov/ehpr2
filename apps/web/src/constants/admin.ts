export enum AdminTab {
  USERS = 'users',
  DOWNLOADS = 'downloads',
  REGISTRANTS = 'registrants',
  MASS_EMAIL_HISTORY = 'mass_email_history',
}

export const adminTabs =
  process.env.NEXT_PUBLIC_FEATURE_MASS_EMAIL === 'true'
    ? [
        { title: 'Download Extract', value: AdminTab.DOWNLOADS },
        { title: 'Registrants', value: AdminTab.REGISTRANTS },
        { title: 'Mass Email History', value: AdminTab.MASS_EMAIL_HISTORY },
      ]
    : [{ title: 'Download Extract', value: AdminTab.DOWNLOADS }];
