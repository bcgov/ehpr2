import { useState } from 'react';
import { FieldProps, Form, Formik } from 'formik';
import { createValidator } from 'class-validator-formik';

import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { DialogTitle } from '@headlessui/react';
import { InviteUserDTO, Role } from '@ehpr/common';
import { BasicSelect } from '@components';

import { Button, Field, Modal, OptionType, useAdminContext } from '@components';

const roleOptions: OptionType[] = Object.values(Role)
  .filter(role => role !== Role.Pending)
  .map(role => ({
    label: _.capitalize(role),
    value: role,
  }));

const SelectRole = ({ field, form }: FieldProps) => (
  <BasicSelect
    id={field.name}
    options={roleOptions}
    value={field.value || roleOptions.find(o => o.value === field.value)?.value}
    onChange={value => form.setFieldValue(field.name, value)}
  />
);

export const InviteUser = () => {
  const { invite } = useAdminContext();
  const [open, setOpen] = useState(false);

  const initialValues: InviteUserDTO = {
    email: '',
    role: Role.User,
  };

  const handleSubmit = async (values: InviteUserDTO) => {
    await invite(values);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getRoleDescription = (role: Role): string => {
    if (role === Role.Admin) {
      return 'Admin can extract submission data, invite and manage users.';
    } else if (role === Role.User) {
      return 'User can extract submission data.';
    }
    return '';
  };

  return (
    <div>
      <div className='mb-4'>
        <Button variant='primary' onClick={() => setOpen(true)}>
          <FontAwesomeIcon className='h-6 mr-2' icon={faUserPlus} />
          <span>Invite</span>
        </Button>
      </div>
      <Modal open={open} handleClose={handleClose}>
        <DialogTitle className='text-lg font-bold leading-6 text-bcBlueLink border-b p-4'>
          Invite a new user
        </DialogTitle>
        <div className='p-4 mt-4'>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validate={createValidator(InviteUserDTO)}
          >
            {({ values, isValid, isSubmitting }) => (
              <Form>
                <div className='mb-4'>
                  <Field name='email' label='Email Address' type='email' />
                </div>
                <div className='flex flex-row align-middle mb-5'>
                  <Field name='role' label='User Role' component={SelectRole} />
                  <div className='ml-4 mt-auto text-bcGray'>{getRoleDescription(values.role)}</div>
                </div>
                <div className='text-right py-3 pr-8'>
                  <Button variant='primary' type='submit' disabled={!isValid || isSubmitting}>
                    Invite
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </div>
  );
};
