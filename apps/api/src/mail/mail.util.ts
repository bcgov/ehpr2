export const getBodyWithFooter = (body: string, token: string, domain?: string) => {
  const unsubUrl = domain
    ? `https://${domain}/unsubscribe?token=${token}`
    : `https://ehpr.gov.bc.ca/unsubscribe?token=${token}`;

  const logoUrl = domain
    ? `https://${domain}/assets/img/MOH_Logo.png`
    : `https://ehpr.gov.bc.ca/assets/img/MOH_Logo.png`;

  return `
    <html>
      <body>
        ${body}
        <footer style="text-align: left;">
          <table cellspacing="0" style="width: 100%">
            <tr>
              <td style="border: solid 1px gray; margin: 0; border-right: none; width: 100px; background-color: #FFFFFF !important">
                <img
                  src="${logoUrl}"
                  alt="Ministry of Health"
                  style="width: 100px; height: 100px;"
                />
              </td>
              <td
                style="
                  color: #2e4877;
                  border: solid 1px gray;
                  border-left-color: #bb902d;
                  line-height: 24px;
                  padding: 8px;
                "
              >
                <p style="margin: 0">
                  <b>Emergency Health Provider Registry Team</b>
                </p>
                <p style="margin: 0">
                  Ministry of Health
                </p>
                <span>
                  <b>Email:</b>
                  <a href="mailto:EHPRQuestions@gov.bc.ca"> ehprquestions@gov.bc.ca </a>
                </span>
              </td>
            </tr>
          </table>
          <p style="font-size: 14px">
            <i style="color: #2e4877">
              Sent from the unceded, ancestral and traditional territories of the Coast Salish
              peoples.
            </i>
          </p>
          <p style="font-size: 12px">
            <i style="color: #2e4877">
              This e-mail is intended solely for the person or entity to which it is addressed and may
              contain confidential and/or privileged information. Any review, dissemination, copying,
              printing or other use of this e-mail by persons or entities other than the addressee is
              prohibited. If you have received this e-mail in error, please contact the sender immediately
              and delete the material from any computer.
            </i>
          </p>
          <p style="font-size: 12px;color: #2e4877">
            To remove yourself from the EHPR, please <a href='${unsubUrl}' target='_blank' rel='noopener noreferrer'> unsubscribe</a> here.
          </p>
        </footer>
      </body>
    </html>
  `;
};

export const updateSubmissionLink = (updateUrl: string, linkText: string) =>
  `<a href='${updateUrl}'>${linkText}</a>`;
