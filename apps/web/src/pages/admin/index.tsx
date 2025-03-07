import { useState } from 'react';
import { Role } from '@ehpr/common';
import {
  AdminProvider,
  AdminRegistrantsTable,
  AdminSection,
  AdminTabs,
  Alert,
  ExtractSubmissions,
  InviteUser,
  MassEmailHistory,
  useAuthContext,
  UserTable,
} from '@components';
import { AdminTab, adminTabs } from '@constants';

const getTabTitle = (tab: AdminTab) => {
  return adminTabs.find(t => t.value === tab)?.title ?? '';
};

const AdminPage = () => {
  const { user } = useAuthContext();

  const [selectedTab, setSelectedTab] = useState(AdminTab.DOWNLOADS);

  // determine which tabs to show
  const tabs =
    user?.role === Role.Admin
      ? [{ title: 'Users', value: AdminTab.USERS }, ...adminTabs]
      : adminTabs;

  if (user?.role === Role.Pending || user?.revokedDate) {
    return (
      <div className='grid h-full place-items-center'>
        <div className='text-xl'>
          You have not been authorized for the features of administration.
        </div>
      </div>
    );
  }

  return (
    <div className='container pt-12'>
      <AdminProvider>
        <AdminTabs tabs={tabs} categoryIndex={selectedTab} onTabChange={setSelectedTab} />
        {selectedTab === AdminTab.DOWNLOADS && (
          <AdminSection title='Downloads'>
            <Alert color='yellow'>
              Health Authority Users must submit a request for activation to the Ministry of Health
              before using the EHPR to address emergency events.
              <br /> All requests must go to{' '}
              <a href='mailto:EHPRQuestions@gov.bc.ca'>
                <b>ehprquestions@gov.bc.ca</b>
              </a>
              .
            </Alert>
            <ExtractSubmissions />
          </AdminSection>
        )}

        {selectedTab === AdminTab.REGISTRANTS && (
          <AdminSection title={getTabTitle(selectedTab)}>
            <AdminRegistrantsTable />
          </AdminSection>
        )}

        {selectedTab === AdminTab.USERS && (
          <AdminSection title={getTabTitle(selectedTab)}>
            <InviteUser />
            <UserTable />
          </AdminSection>
        )}

        {selectedTab === AdminTab.MASS_EMAIL_HISTORY && (
          <AdminSection title={getTabTitle(selectedTab)}>
            <MassEmailHistory />
          </AdminSection>
        )}
      </AdminProvider>
    </div>
  );
};

export default AdminPage;
