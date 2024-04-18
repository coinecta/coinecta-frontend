import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import { NextPage } from 'next';
import Link from '@components/Link';

const listStyle = {
  pl: "40px",
  pb: "32px",
  listStyleType: "disc",
  "& li": {
    display: "list-item",
    mb: 0,
    pl: 0,
  },
}

const TermsOfUse: NextPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Coinecta Terms of Use
        </Typography>

        <Typography variant="body2">
          Last modified: April 17, 2024
        </Typography>

        <Typography variant="h5" component="h1" gutterBottom>
          Disclaimer
        </Typography>

        <Typography variant="body2">
          Crypto-tokens are a high-risk asset class where you can face the risk of total loss of the value of purchase, as well as loss of crypto-tokens or other assets you hold if your information to access crypto-tokens or other assets is compromised.
        </Typography>

        <Typography variant="body2">
          Scams involving crypto-tokens and digital wallets, and harmful imitations of blockchain-based platforms are common. Please take upmost care to interact only with the official Coinecta Platform, including Interface and Coinecta Application. Official links to each are contained in these Terms.
        </Typography>

        <Typography variant="body2">
          Coinecta does not endorse, verify, or validate any Project Team or the terms, features, obligations, or other aspects of their Project Tokens.
        </Typography>

        <ol className="olStart">
          <li>Introduction
            <ol>
              <li>These Terms of Use (Terms) govern your access to and use of the Coinecta Platform.</li>
              <li>Please read these Terms carefully since your access to and use of the Coinecta Platform implies you have understood and have the legal capacity to agree to these Terms.</li>
              <li>You are responsible for seeking your own independent and professional advice regarding your eligibility to access or use the Coinecta Platform.</li>
              <li>We will not invite, target, or solicit any person to access and use the Coinecta Platform, but will assume you are eligible to access and use the Coinecta Platform if you proceed to engage with the Interface and Activities. If you reside outside of El Salvador, we may be limited in the way that we can respond to any queries you raise with us.</li>
              <li>You must, regardless of the capacity in which you are accessing or using the Coinecta Platform, and interacting with Activities:
                <ol>
                  <li>not access or use if such access or use is prohibited by Applicable Laws;</li>
                  <li>not access or use if you disagree to these Terms because we will assume you have agreed to the Terms by your access and use of the Coinecta Platform and that you have the legal capacity to be bound by these Terms;</li>
                  <li>opt out of the arbitration and class action/jury trial waiver (at clause 4) if you do not agree to use arbitration on an individual basis to resolve disputes; and</li>
                  <li>be at least the age of majority in your jurisdiction (e.g., 18 years old).</li>
                </ol>
              </li>
              <li>Be warned that your access and use of the Coinecta Platform will give rise to you creating a legal relationship us, our Affiliates, and subsidiaries worldwide, as well as separately with third parties. You are responsible for reading and determining your eligibility to enter other legal relationships in accordance with the terms provided by those third parties. </li>
              <li>Except for CNCT Tokens, Coinecta does not issue Project Tokens and does not take responsibility for the creation, listing, or management of Project Tokens. </li>
              <li>These Terms do not govern your interaction with, or reliance upon, any third-party software nor the reliability, safety, or continuity of the Cardano blockchain and its network including transactions and balances recorded on the Cardano blockchain ledger. </li>
              <li>
                By using the Coinecta Platform, you understand that:
                <ol>
                  <li>you are not:
                    <ol>
                      <li>
                        buying or selling Project Tokens from or to Coinecta (also referred to as &quot;we&quot; or &quot;us&quot;),
                      </li>
                      <li>
                        staking or dealing in your Project Tokens with us, or
                      </li>
                      <li>
                        paying ADA Tokens to us,
                      </li>
                    </ol>
                  </li>
                  <p>and in respect of each of the above items you may or will create a legal relationship with one or more third parties, but</p>
                  <li>in respect of your legal relationship with us, you may be one or both of:
                    <ol>
                      <li>
                        a licensee of our proprietary software and Interface Content, and
                      </li>
                      <li>
                        a customer of ours in respect of your purchase of our CNCT Tokens.
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>
                If our Activities expand, we may need to provide additional terms to cover the expanded services or activities offering (Additional Terms). Any Additional Terms which are available with the relevant services or activities become part of your agreement with us if you use those services or engage with those activities.
              </li>
              <li>
                These Terms and our Privacy Policy (available <Link href="/privacy">here</Link>) and any Additional Terms comprise the entire agreement between Coinecta and you in relation to your use of the Coinecta Platform, including the Interface and Coinecta Application, and create a binding legal arrangement between you and Coinecta.
              </li>
              <li>
                If you do not understand or agree to these Terms, or if you do not agree with any updates or changes, then you must immediately stop accessing or using the Coinecta Platform.
              </li>
              <li>
                Coinecta reserves the right to review and change any of the Terms by updating them at its sole discretion at any time. Any changes to the Terms take immediate effect from the date of their publication. When Coinecta updates the Terms, it will update the last modified date at the top of these Terms and use reasonable endeavours to provide you with notice of updates to the Terms.
              </li>
              <li>
                We recommend you keep a copy of the Terms, and any updates to the Terms, for your records.
              </li>
              <Typography variant="h6" sx={{ mb: 2 }}>About Us</Typography>
              <li>
                The Coinecta Platform is owned and administered by Benevolent S.A. de C.V., a corporation registered in El Salvador, operating as Coinecta (Coinecta, we, us or our).
              </li>
              <li>
                Coinecta does not hold any licences in any jurisdictions that cover securities transactions, financial services providers, financial market operators, crypto-asset or virtual-asset services providers, or other regulated activities. You do not have the protections afforded under such laws and regulations when you access and use the Coinecta Platform.
              </li>
              <li>
                To the maximum extent permitted by Applicable Laws, Coinecta does not accept any responsibility or liability for your access or use of the Coinecta Platform, or you&apos;re your purchase and dealings with Project Tokens launched via the Coinecta Platform.
              </li>
            </ol>
          </li>
          <li>Definitions
            <ul>
              <li>
                &quot;Activities&quot; means:
                <ol>
                  <li>
                    accessing the Interface to view Interface Content in accordance with the Interface Content Licence;
                  </li>
                  <li>
                    using the Coinecta Application by:
                    <ol>
                      <li>
                        connecting a third-party software wallet compatible to send instructions, and sign transactions, on the Cardano blockchain;
                      </li>
                      <li>
                        entering instructions via the Interface to sell a balance of ADA Tokens for a balance of a Project&apos;s Tokens, or vice versa;
                      </li>
                      <li>
                        entering instructions via the Interface to contribute a balance of ADA crypto-tokens in return for a balance of a Project&apos;s Tokens;
                      </li>
                      <li>
                        entering instructions via the Interface to stake crypto-tokens; and
                      </li>
                      <li>
                        other activities added by Coinecta, from time to time.
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>
                &quot;Affiliate&quot; means, in relation to a person, any company or other entity, which directly or indirectly controls, is controlled by, or is under joint control with, that person.
              </li>
              <li>
                &quot;Applicable Laws&quot; means acts, statutes, regulations, ordinances, treaties, guidelines, and policies issued by governmental organizations or regulatory bodies relevant to a certain party.
              </li>
              <li>
                &quot;Coinecta&quot; means Benevolent S.A. de C.V., a company registered in El Salvador.
              </li>
              <li>
                &quot;Coinecta Application&quot; means the proprietary Cardano-based protocol designed and deployed by us to the Cardano blockchain which allows a Project Team to launch a Project Token for sale and staking, which can be displayed on the Interface but may also be displayed on third party user interfaces operated independently of Coinecta.
              </li>
              <li>
                &quot;Coinecta Platform&quot; refers to the Coinecta Interface and Coinecta Application.
              </li>
              <li>
                &quot;Coinecta Tokens&quot; or &quot;CNCT Tokens&quot; means the official supply of crypto-tokens referred to by ticker &quot;CNCT&quot; deployed on the Cardano blockchain with policy ID: c27600f3aff3d94043464a33786429b78e6ab9df5e1d23b774acb34c, visible at <Link href="https://cardanoscan.io/tokenPolicy/c27600f3aff3d94043464a33786429b78e6ab9df5e1d23b774acb34c">https://cardanoscan.io/tokenPolicy/c27600f3aff3d94043464a33786429b78e6ab9df5e1d23b774acb34c</Link>.
              </li>
              <li>
                &quot;Interface&quot; refers to the user interface located at https://coinecta.fi, which provides Users with the ability to communicate with the Coinecta Application to enjoy the Activities.
              </li>
              <li>
                &quot;Interface Content&quot; means all information displayed on the Interface which is owned or licensed from third parties by Coinecta.
              </li>
              <li>
                &quot;Interface Content Licence&quot; means the non-exclusive, royalty-free licence granted by Coinecta to you to view the Interface Content for personal and non-commercial use.
              </li>
              <li>
                &quot;Project&quot; means a Cardano-based blockchain project undertaken by a third party.
              </li>
              <li>
                &quot;Project Team&quot; means one or more persons with the authority and ability under Applicable Laws to work on a Project, display the Project on the Interface, and have Users engage in Activities with respect to the Project and Project Tokens via the Interface.
              </li>
              <li>
                &quot;Project Tokens&quot; means the official supply of a Project&apos;s crypto-tokens referred to by the ticker nominated by the Project Team.
              </li>
              <li>
                &quot;Services&quot; means discretionary commercial and advisory services that may be provided by us to a Project to assist with the Project&apos;s development and marketing subject to a separate agreement between us and the Project.
              </li>
              <li>
                &quot;User(s)&quot; means individuals or persons, each with the capacity to understand and agree to these Terms, that access or use the Coinecta Platform, including the Activities via the Interface.
              </li>
            </ul>
          </li>
          <li>Risk Disclosure
            <ol>
              <li>By accessing the Coinecta Platform, you acknowledge and assume the following risks noting that the risks listed below are neither a complete nor exhaustive representation of the risks you face by your access and use of the Coinecta Platform:
                <ol>
                  <li>
                    Risk of Loss in Value: Tokens and digital currencies lack backing by central banks or hard assets, and their value is influenced by various factors, including market conditions and regulatory measures. This volatility may lead to partial or total loss of the crypto-token&apos;s value. No guarantees are provided regarding liquidity or market price.
                  </li>
                  <li>
                    Regulatory Change: The regulatory framework for crypto-tokens and crypto-token activities is subject to revision and may materially affect the value of crypto-tokens or a User&apos;s access to wallets and blockchains to deal with balances of crypto-tokens.
                  </li>
                  <li>
                    Technical and System Failures: The Coinecta Platform and associated blockchain infrastructure may experience system failures, interruptions, defects, security breaches, or other causes beyond our control. Hacks, cyber-attacks, and other incidents may occur without timely detection, potentially impacting the security and stability of the Coinecta Platform including Coinecta Application.
                  </li>
                </ol>
              </li>
            </ol>
          </li>
          <li>Arbitration
            <ol>
              <li>
                Any dispute, controversy, or claim arising out of or in relation to these Terms, including the validity, invalidity, breach, or termination thereof, shall be settled by arbitration in accordance with the applicable laws in El Salvador. There shall be one arbitrator; the appointing authority may be based on mutual agreement, be chosen by the parties or in the absence of such agreement, the court may designate an appointing authority. The seat of the arbitration shall be El Salvador and the language of the arbitration shall be English. The applicable law shall be the law of El Salvador or another choice of law determined in Coinecta&apos;s sole discretion.
              </li>
              <li>

                With respect to all persons and entities, regardless of whether they have obtained or used the site for personal, commercial, or other purposes, all disputes, controversies or claims must be brought in the parties&apos; individual capacity, and not as a plaintiff or class member in any purported class action, collective action or other representative proceeding. This waiver applies to class arbitration, and, unless we agree otherwise, the arbitrator may not consolidate more than one person&apos;s claims. You agree that, by entering into this agreement, you and Coinecta are each waiving the right to a trial by jury or to participate in a class action, collective action, or other representative proceeding of any kind.

              </li>
            </ol>
          </li>
          <li>General Provisions
            <ol>
              <li>

                Links to and from the Website: You may gain access from the Coinecta Platform to third-party services operated or made available by persons other than us (&quot;Third-Party Services&quot;). Such hyperlinks are provided for your convenience, and Coinecta has no control over the content of these sites or resources. Coinecta accepts no responsibility for them or for any loss or damage that may arise from your use of them.
              </li>
              <li>

                Disclaimer for Accessibility of the Website and the Services: The Coinecta Platform and any Activities possible via the Interface and Coinecta Application are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Coinecta makes no warranty or representation regarding the accuracy, completeness, safety, or timeliness of the information provided on and via the Coinecta Platform. You accept that any reliance on such information is at your own risk.
              </li>
              <li>
                Governing Law and Jurisdiction: These Terms and your access and use of the Coinecta Platform and any Activities possible via the Interface shall be governed by and construed in accordance with the laws of El Salvador. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of El Salvador.

              </li>
              <li>
                Eligibility: As a User, you confirm that you are not presently subjected to any economic or trade sanctions enforced by any governmental authority or organization, nor are you listed as a prohibited or restricted party, including listings maintained by the United Nations. Furthermore, you confirm that you are not a citizen, resident, or organized in a jurisdiction or territory that is currently under comprehensive country-wide, territory-wide, or regional economic sanctions imposed by the United Nations. You further represent and warrant that your access and use of the Coinecta Platform will comply with all Applicable Laws, and that you will not use the Coinecta Platform to conduct, promote, or facilitate any illegal activity. This includes but not limited to money laundering, terrorist financing, fraud, or any other illegal activities.
              </li>
              <li>
                User Obligations: By using the Coinecta Platform, you agree to comply with all Applicable Laws and that you are responsible for performing your own research and due diligence before participating in any Activities via the Coinecta Platform. Engaging in any such Activities is at your own risk. You shall not engage in any activity that is illegal, unethical, or violates these Terms. Prohibited activities include but are not limited to:

              </li>
              <ol>
                <li>
                  Engaging in any form of market manipulation or fraudulent activities.
                </li>
                <li>
                  Attempting to gain unauthorized access to the Coinecta Platform or other Users&apos; accounts.
                </li>
                <li>
                  Introducing malware, viruses, or any other harmful code that may disrupt or compromise the platform&apos;s security.
                </li>
                <li>
                  Engaging in any illegal activities or violating applicable laws and regulations.

                </li>
              </ol>
              <li>
                Sign in: To access and use the Coinecta Application, you are required to sign in with your preferred web3 credentials. You are responsible for maintaining the confidentiality of your credentials and for all Activities that occur with your credentials and crypto-token balances referable to your credentials.
              </li>
              <li>

                Interface Content Licence: We grant you a limited, non-exclusive, non-transferable license to access and use the intellectual property owned or licensed by us solely for the purpose of your access and use of the Coinecta Platform. You shall not reproduce, modify, distribute, or exploit our intellectual property without our prior written consent.

              </li>
              <li>
                Limitation of Liability: Notwithstanding any provisions within these Terms, in no event will we, our partners, Affiliates, employees, agents, officers, or directors be liable to you for any incidental, special, exemplary, punitive, indirect, or consequential damages of any kind, arising out of or in connection with your access and use of the Coinecta Platform, or any third party software or services necessary or associated with your access and use of the Coinecta Platform.
              </li>
              <li>
                Indemnification: You agree to indemnify and hold harmless Coinecta, its Affiliates, licensors, shareholders, officers, directors, managers, employees, and agents from any losses, claims, actions, damages, demands, liabilities, costs, and expenses arising out of or related to your access or use of the Coinecta Platform, or any third party software or services necessary or associated with your access and use of the Coinecta Platform.
              </li>
              <li>
                No Financial and Legal Advice: Coinecta is not your broker, intermediary, agent, or legal advisor. No communication or information provided by us shall be considered as investment advice, financial advice, or legal advice. You should consult independent professionals before executing any transactions or investments.
              </li>
              <li>
                Dispute Resolution: Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of El Salvador.
              </li>
              <li>
                Severability: If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by Applicable Laws.
              </li>
              <li>
                Suspension or Termination of Services: The Company reserves the right to suspend or terminate your access to the services without prior notice if you engage in any prohibited activities, violate the terms of service, or if your continued use poses a risk to the platform or other users.
              </li>
              <li>
                Modification of Coinecta Platform: Coinecta reserves the right to modify, update, or discontinue certain features or functionalities of the Interface and Coinecta Application at any time without prior notice. Coinecta shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Interface and / or Coinecta Application.
              </li>
              <li>
                Project Team Responsibility: Teams utilizing the Coinecta Platform to launch their Project Tokens are solely responsible for ensuring:
              </li>
              <ol>
                <li>
                  the Project Token is a utility token and not characterised as security or other financial product; and
                </li>
                <li>
                  that all Applicable Laws are being complied with in respect of all information displayed or linked via the Coinecta Platform as well as in respect of all Activities possible via the Coinecta Application,
                  by seeking independent and professional legal advice prior to the display of the Project Token on the Coinecta Platform.
                </li>
              </ol>
              <li>
                Force majeure: Coinecta shall not be liable for any failure or delay in the performance of its obligations under these terms resulting from events beyond its reasonable control, including but not limited to natural disasters, acts of government, or technical malfunctions.
              </li>
              <li>
                Entire agreement: These terms constitute the entire agreement between you and the Company regarding your use of the platform and supersede any prior agreements or understandings.
              </li>
            </ol>
          </li>
        </ol>



      </Box>
    </Container>
  );
};

export default TermsOfUse;