import React from 'react';
import { Typography, Box, List, ListItem, Container } from '@mui/material';

const listStyle = {
  pl: "40px",
  pb: "32px",
  listStyleType: "disc",
  "& li": {
    display: "list-item",
    pl: 0,
  },
}

const CoinectaTermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Coinecta Terms of Service
        </Typography>

        <Typography variant="body2">
        Last modified: May 19, 2023
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          1. Introduction
        </Typography>

        <Typography variant="body2">
          1.1 These Terms of Service (hereinafter referred to as "Terms") govern the use and conditions of the website located
          at{' '}
          <Typography component="a" href="https://coinecta.finance" target="_blank" rel="noopener">
            https://coinecta.finance
          </Typography>{' '}
          (hereinafter referred to as the "Website") and the services provided by Benevolent SA de CV (hereinafter referred
          to as the "Company" or "We" or "Us"), a corporation registered in El Salvador. These Terms constitute a binding and
          enforceable legal contract between the Company and its affiliates and subsidiaries worldwide, and you, an end user
          of the Services (hereinafter referred to as "You" or "User") in relation to the Services. By accessing,
          registering, using, or clicking on the Services and information made available by the Company via the Website, you
          hereby accept and agree to all the Terms set forth herein. If you do not agree to these Terms, you may not access
          or use the Website and the Services.
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          2. Definitions
        </Typography>

        <List sx={listStyle}>
          <ListItem>
            <Typography>
              "Affiliate" means, in relation to a person, any company or other entity, whether or not with legal personality,
              which directly or indirectly controls, is controlled by, or is under joint control with that person.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              "Applicable Laws" refers to acts, statutes, regulations, ordinances, treaties, guidelines, and policies issued by
              governmental organizations or regulatory bodies relevant to a certain party.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>"Company" refers to Benevolent SA de CV.</Typography>
          </ListItem>
          <ListItem>
            <Typography>"Platform" refers to Coinecta Finance, the online platform operated by the Company.</Typography>
          </ListItem>
          <ListItem>
            <Typography>"Project" refers to Projects launched on the Platform.</Typography>
          </ListItem>
          <ListItem>
            <Typography>
              "Services" refers to the features, functionalities, and offerings provided by the Company through the Website.
              These may include but are not limited to access to the online platform, the exchange or trading of
              cryptocurrencies or tokens, participation in token sales or staking activities, access to information, and any
              other services made available by the Company through the Website.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              "Tokens" refers to Coinecta Tokens (CNCT) and other Project Tokens available on the Platform.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              "User(s)" refers to individuals or entities accessing and using the Company Services.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>"Website" refers to the website associated with the Platform.</Typography>
          </ListItem>
        </List>

        <Typography variant="h4" component="h2" gutterBottom>
          3. General Provisions
        </Typography>

        <Typography variant="body2">
          3.1 Contractual Relationship: These Terms constitute a valid and binding agreement between You and the Company. The
          binding obligations stipulated in these Terms are enforceable. To access or use the Platform, you must be able to form
          a legally binding contract with us. Accordingly, you represent that you are at least the age of majority in your jurisdiction
          (e.g., 18 years old) and have the full right, power, and authority to enter into and comply with the terms and conditions of
          this Agreement on behalf of yourself and any company or legal entity for which you may access or use the Interface.
        </Typography>

        <Typography variant="body2">
          3.2 Revision and Amendments: The Company reserves the right to revise, amend, or update any clauses and provisions
          stipulated in these Terms in its sole discretion at any time. You are advised to check these Terms periodically to
          ensure that you are cognizant of the current versions and comply with them.
        </Typography>

        <Typography variant="body2">
          3.3 Privacy Policy: The Company collects, uses, stores, and protects user data in accordance with applicable data
          protection laws. By using the platform, you acknowledge and agree to the Company&apos;s Privacy Policy, which outlines
          the types of data collected, how it is used, and your rights regarding your personal information.
        </Typography>

        <Typography variant="body2">
          3.4 Links to and from the Website: You may gain access from the Website to third-party services operated or made
          available by persons other than us ("Third-Party Services"). Such hyperlinks are provided for your convenience,
          and the Company has no control over the content of these sites or resources. The Company accepts no responsibility
          for them or for any loss or damage that may arise from your use of them.
        </Typography>

        <Typography variant="body2">
          3.5 Disclaimer for Accessibility of the Website and the Services: The Website and the Services are provided on an
          &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Company makes no warranty or representation regarding the accuracy,
          completeness, or timeliness of the information provided on the platform. You accept that any reliance on such
          information is at your own risk.
        </Typography>

        <Typography variant="body2">
          3.7 Governing Law and Jurisdiction: These Terms and your use of the Website and the Services shall be governed by and
          construed in accordance with the laws of El Salvador. Any dispute arising out of or in connection with these Terms shall
          be subject to the exclusive jurisdiction of the courts of El Salvador.
        </Typography>

        <Typography variant="body2">
          3.8 Eligibility: As a user of the Interface, you declare and guarantee that you are not presently subjected to any economic or
          trade sanctions enforced by any governmental authority or organization, nor are you listed as a prohibited or restricted
          party, including listings maintained by the United Nations. Furthermore, you affirm and guarantee that you are not a citizen,
          resident, or organized in a jurisdiction or territory that is currently under comprehensive country-wide, territory-wide,
          or regional economic sanctions imposed by the United Nations. You further represent and warrant that your access and use of the Interface will comply with all applicable laws and
          regulations, and that you will not use the Interface to conduct, promote, or facilitate any illegal activity. This
          includes but not limited to money laundering, terrorist financing, fraud, or any other illegal activities.
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          4. Risk Disclosure
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          4.1 By accessing the Website or using the Company Services, you acknowledge and assume the following risks:
        </Typography>

        <List sx={listStyle}>
          <ListItem>
            <Typography>
              Risk of Loss in Value: Tokens and digital currencies lack backing by central banks or hard assets, and their
              value is influenced by various factors, including market conditions and regulatory measures. This volatility may
              lead to partial or total loss of the Tokens&apos; value. No guarantees are provided regarding liquidity or market
              price.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Regulatory Regime: The regulatory framework for tokens and digital currencies is subject to revision and may
              materially affect Token value or User access to wallets and blockchains.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Technical and System Failures: The Website and associated blockchain infrastructure may experience system
              failures, interruptions, defects, security breaches, or other causes beyond the Company&apos;s control. Hacks,
              cyber-attacks, and other incidents may occur without timely detection, potentially impacting the security and
              stability of the Company&apos;s network and services.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="h4" component="h2" gutterBottom>
          5. Terms of Use
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          5.1 User Obligations: By using the Website and the Services, you agree to comply with all applicable laws and
          regulations. You shall not engage in any activity that is illegal, unethical, or violates these Terms. Prohibited
          activities include but are not limited to:
        </Typography>

        <List sx={listStyle}>
          <ListItem>
            <Typography>
              Engaging in any form of market manipulation or fraudulent activities.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Attempting to gain unauthorized access to the platform or other users&apos; accounts.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Introducing malware, viruses, or any other harmful code that may disrupt or compromise the platform&apos;s security.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Engaging in any illegal activities or violating applicable laws and regulations.
            </Typography>
          </ListItem>
        </List>

        <Typography variant="body2">
          5.2 Account Registration: In order to access certain features or Services on the Website, you may be required to
          create an account and provide accurate and complete information. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities that occur under your account.
        </Typography>

        <Typography variant="body2">
          5.3 Intellectual Property: The Company grants you a limited, non-exclusive, non-transferable license to access and
          use the intellectual property owned or licensed by the Company solely for the purpose of using the platform and its
          services. You shall not reproduce, modify, distribute, or exploit the Company&apos;s intellectual property without
          prior written consent.
        </Typography>

        <Typography variant="body2">
          5.4 Limitation of Liability: Notwithstanding any provisions within these Terms, in no event will the Company, its
          partners, affiliates, employees, agents, officers, or directors be liable to you for any incidental, special,
          exemplary, punitive, indirect, or consequential damages of any kind, arising out of or in connection with your use
          of the Website, the Services, or any other items obtained through the Website.
        </Typography>

        <Typography variant="body2">
          5.5 Indemnification: You agree to indemnify and hold harmless the Company, its affiliates, licensors, shareholders,
          officers, directors, managers, employees, and agents from any losses, claims, actions, damages, demands,
          liabilities, costs, and expenses arising out of or related to your use or participation in the Services.
        </Typography>

        <Typography variant="body2">
          5.6 No Financial and Legal Advice: The Company is not your broker, intermediary, agent, or legal advisor. No
          communication or information provided by the Company shall be considered as investment advice, financial advice, or
          legal advice. You should consult independent professionals before executing any transactions or investments.
        </Typography>

        <Typography variant="body2">
          5.7 Dispute Resolution: Any dispute arising out of or in connection with these Terms shall be subject to the
          exclusive jurisdiction of the courts of El Salvador.
        </Typography>

        <Typography variant="body2">
          5.8 Severability: If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining
          provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
        </Typography>

        <Typography variant="body2">
          5.9 Suspension or Termination of Services: The Company reserves the right to suspend or terminate your access to the
          services without prior notice if you engage in any prohibited activities, violate the terms of service, or if your
          continued use poses a risk to the platform or other users.
        </Typography>

        <Typography variant="body2">
          5.10 Modification of Services: The Company reserves the right to modify, update, or discontinue certain features or
          functionalities of the platform at any time without prior notice. The Company shall not be liable to you or any
          third party for any modification, suspension, or discontinuation of the services.
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          6. Force Majeure
        </Typography>

        <Typography variant="body2">
          6.1 The Company shall not be liable for any failure or delay in the performance of its obligations under these terms
          resulting from events beyond its reasonable control, including but not limited to natural disasters, acts of
          government, or technical malfunctions.
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          7. Entire Agreement
        </Typography>

        <Typography variant="body2">
          7.1 These terms constitute the entire agreement between you and the Company regarding your use of the platform and
          supersede any prior agreements or understandings.
        </Typography>
      </Box>
    </Container>
  );
};

export default CoinectaTermsOfService;