import { Ret } from 'class-validator-formik/dist/convertError';

export interface ReviewType {
  confirm: boolean;
  captcha: boolean;
}

export const reviewDefaultValues = {
  confirm: false,
  captcha: false,
};

export const reviewSchema = (values: unknown): Ret => {
  if (!(values as ReviewType).confirm) {
    return {
      confirm: 'This field must be checked',
    };
  }
  if (!(values as ReviewType).captcha) {
    return {
      captcha: 'This field must be checked',
    };
  }
  return {};
};
