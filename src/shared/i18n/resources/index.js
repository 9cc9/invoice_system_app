/**
 * 翻译资源汇总
 */

import zhCNCommon from './zh-CN/common.json';
import zhCNAuth from './zh-CN/auth.json';
import zhCNReimbursement from './zh-CN/reimbursement.json';
import esBOCommon from './es-BO/common.json';
import esBOAuth from './es-BO/auth.json';
import esBOReimbursement from './es-BO/reimbursement.json';
import enUSCommon from './en-US/common.json';
import enUSAuth from './en-US/auth.json';
import enUSReimbursement from './en-US/reimbursement.json';

export const resources = {
  'zh-CN': {
    common: zhCNCommon,
    auth: zhCNAuth,
    reimbursement: zhCNReimbursement,
  },
  'es-BO': {
    common: esBOCommon,
    auth: esBOAuth,
    reimbursement: esBOReimbursement,
  },
  'en-US': {
    common: enUSCommon,
    auth: enUSAuth,
    reimbursement: enUSReimbursement,
  },
};
