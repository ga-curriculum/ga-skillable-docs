/* =====================================================================
   SKILLABLE AT GA  |  site-config.js
   The settings that are shared by every page. Edit here, save, refresh.

   WHAT LIVES HERE
     1. Site name, version and date          (shown in the footer)
     2. Who to contact for help              (shown in the sidebar and on help pages)
     3. Shared links (TMS sign-in, support)  (change a link ONCE, every page updates)
     4. The menu: groups of pages            (sidebar and section pages)

   RULES FOR EDITING
     - Keep the double quotes "like this" around text.
     - Keep the commas at the end of each line.
     - Don't put a double quote inside text. Use an apostrophe or a curly quote instead.
     - If something breaks, undo your last change. The most common cause is a
       missing quote or a missing comma.
   ===================================================================== */

window.SITE = {

  /* ---- 1. Site basics ---- */
  name: "Skillable at GA",
  version: "v2",
  updated: "October 2026",

  /* Show a dashed "Screenshot to add" box where a screenshot file is missing?
     true  = yes (good while you are still adding screenshots)
     false = hide the box until the file exists */
  showPlaceholders: true,

  /* ---- 2. Who to contact for help (shown in the sidebar and on help pages) ---- */
  labAdmin: {
    name: "Lauren",
    email: "lauren.perez@generalassemb.ly"
  },

  /* ---- 3. Shared links ----
     In any page, write  <a data-link="tms"></a>  and the link and its text
     fill in from here. Available names: tms, supportEmail, support, status, speedTest, docs, loginHelp */
  links: {
    tms: "https://generalassembly.learnondemand.net/",
    supportEmail: "generalassemblysupport@skillable.zendesk.com",
    support: "https://www.skillable.com/customer-support/",
    status: "https://status.skillable.com",
    speedTest: "https://www.skillable.com/customer-support/speed-test/",
    docs: "https://docs.skillable.com",
    loginHelp: "https://generalassembly.learnondemand.net/User/LoginAssistance"
  },

  /* ---- 4. The menu ----
     Each GROUP is a section of the site. 'side' is its name in the sidebar. Each PAGE inside it needs:
       file     where the page lives (relative to the site's main folder)
       title    the name shown on section pages and the page tab
       nav      a shorter name for the sidebar (optional)
       summary  one sentence that says what the page helps you do
       time     rough reading time
       who      who the page is for
       keywords extra words people might search for (optional)
       next     the page to suggest next, if it isn't simply the next one in the list (optional)
     The order here is the order people see. A group with sequence: false is a
     set of alternatives rather than steps, so it has no Previous/Next buttons. The first page in each group
     is that group's home page.

     To add a page: copy _templates/new-page.html, save it in the right folder,
     then add an entry below. See help/how-to-edit.html for the steps. */
  groups: [

    {
      id: "get-started",
      title: "Get started",
      side: "Get started",
      pages: [
        { file: "get-started/index.html", title: "Get started with Skillable", summary: "Start here if Skillable is new to you.", time: "1 min", who: "Everyone" },
        { file: "get-started/what-is-skillable.html", nav: "Why we use Skillable", title: "Why we use Skillable", summary: "Real tools, identical environments from the first minute, and instructors who can see what's happening.", time: "5 min", who: "Everyone" },
        { file: "get-started/sign-in.html", nav: "Sign in to TMS", title: "Sign in to TMS for the first time", summary: "Sign in, set your password, reset it if you forget it, and know what you should see for your role.", time: "4 min", who: "Everyone" },
        { file: "get-started/what-learners-see.html", nav: "The student experience", title: "The student experience on Skillable", summary: "From inbox to running lab: the learner journey, the tech check, the lab window and the Exit menu.", time: "8 min", who: "Everyone" },
        { file: "get-started/who-does-what.html", nav: "Who does what", title: "Who does what", summary: "Every role on a Skillable program and who owns each task.", time: "5 min", who: "Everyone" },
        { file: "get-started/glossary.html", nav: "Glossary", title: "Glossary", summary: "Every term you'll hear, from Studio and TMS to lab instance and enrollment status.", time: "quick reference", who: "Everyone" }
      ]
    },

    {
      id: "instructors",
      title: "For instructors",
      side: "For instructors",
      pages: [
        { file: "instructors/index.html", nav: "Start here", title: "Instructor onboarding", summary: "Get ready to teach on Skillable in about 30 minutes.", time: "5 min", who: "Instructors and TAs" },
        { file: "instructors/find-your-class.html", nav: "Find your class", title: "Find your class and get ready to teach", summary: "My Calendar, My Classes, the Class page and the roster, and testing your lab before learners do.", time: "5 min", who: "Instructors and TAs" },
        { file: "instructors/how-labs-work.html", nav: "How labs work", title: "How labs work: the mental model", summary: "Images, not machines. What survives between launches, saving, timeouts and the save-your-work routine.", time: "10 min", who: "Instructors and TAs" },
        { file: "instructors/during-class.html", nav: "During class", title: "During class: see and help learners", summary: "What you can see in Monitor Labs, messaging a learner, Take Control, sharing files and turning labs on or off.", time: "8 min", who: "Instructors and TAs" },
        { file: "instructors/faq.html", nav: "FAQ", title: "Instructor FAQ", summary: "Quick answers about non-persistent labs, environment variables, saving and timeouts.", time: "quick reference", who: "Instructors and TAs" },
        { file: "instructors/troubleshooting.html", nav: "When something goes wrong", title: "When something goes wrong", summary: "Triage, the fix order, common problems, who to contact and how to open a Skillable ticket.", time: "8 min", who: "Instructors and TAs" }
      ]
    },

    {
      id: "labs",
      title: "For LEDs",
      side: "For LEDs",
      pages: [
        { file: "lab-authors/index.html", nav: "Start here", title: "LED onboarding", summary: "Turn the lab instructions you already write into Skillable labs.", time: "5 min", who: "Learning experience designers" },
        { file: "lab-authors/how-a-lab-gets-built.html", nav: "How a lab gets built", title: "How a lab gets built", summary: "Who does what, what to hand over, and how much lead time each step needs.", time: "5 min", who: "LEDs and SMEs" },
        { file: "lab-authors/writing-instructions.html", nav: "Writing instructions", title: "Writing lab instructions", summary: "Structure, step-writing and formatting conventions for GA labs.", time: "10 min", who: "LEDs and SMEs" },
        { file: "lab-authors/markdown-reference.html", nav: "Markdown reference", title: "Skillable Markdown reference", summary: "Every piece of Skillable syntax you're likely to need, with examples.", time: "quick reference", who: "LEDs and SMEs" },
        { file: "lab-authors/activities-and-scoring.html", nav: "Activities and scoring", title: "Activities, checks and scoring", summary: "How to specify the questions, automated checks and scoring for a lab.", time: "8 min", who: "LEDs and SMEs" },
        { file: "lab-authors/test-a-lab.html", nav: "Test a lab", title: "Test a lab before learners do", summary: "What to check, how to walk a lab end to end, and how to report what you find.", time: "6 min", who: "LEDs, SMEs and contractors testing labs" },
        { file: "lab-authors/request-a-change.html", nav: "Request a change", title: "Request a lab change", summary: "What to send, how much notice to give, and when a change reaches learners.", time: "5 min", who: "LEDs, SMEs, instructors and CSMs" }
      ]
    },

    {
      id: "smes",
      title: "For SMEs",
      side: "For SMEs",
      pages: [
        { file: "smes/index.html", nav: "Start here", title: "SME onboarding", summary: "Specify the lab environment: tools, packages, cloud services, access and credentials.", time: "5 min", who: "Subject matter experts" },
        { file: "smes/tech-requirements.html", nav: "Tech requirements", title: "Write the tech requirements", summary: "Everything needed to build the machine image and any cloud services, section by section.", time: "8 min", who: "Subject matter experts" },
        { file: "smes/cloud-labs.html", nav: "Cloud services and credentials", title: "Cloud services, access and credentials", summary: "How cloud subscriptions, sign-in details, keys and network access work in Skillable labs.", time: "8 min", who: "Subject matter experts and LEDs" }
      ]
    },

    {
      id: "programs",
      title: "For CSMs",
      side: "For CSMs",
      pages: [
        { file: "csms/index.html", nav: "Start here", title: "CSM onboarding", summary: "Get learners into TMS, keep enrollments right, and report back to clients.", time: "5 min", who: "Client success managers" },
        { file: "csms/launch-checklist.html", nav: "Launch checklist", title: "Program launch checklist", summary: "Every task, owner and lead time from first decisions to wrap-up.", time: "8 min", who: "The whole delivery team" },
        { file: "csms/roster-csv.html", nav: "How learners get enrolled", title: "How learners get enrolled", summary: "Roster CSV or training key: when to use each, and how to prepare for them.", time: "5 min", who: "CSMs" },
        { file: "csms/manage-enrollments.html", nav: "Enroll and manage learners", title: "Enroll and manage learners in TMS", summary: "Enroll a class, add or remove a learner, move learners, and fix account problems.", time: "8 min", who: "CSMs" },
        { file: "csms/welcome-email.html", nav: "Welcome email", title: "Learner welcome email", summary: "A ready-to-send email that gets every learner signed in and through the tech check.", time: "3 min", who: "CSMs" },
        { file: "csms/learner-handout.html", nav: "Learner handout", title: "Learner handout: quick-start guide", summary: "The handout you send to learners with the welcome email.", time: "5 min", who: "CSMs, to send to learners" },
        { file: "csms/reporting-and-grading.html", nav: "Reporting and grading", title: "Reporting, grading and client updates", summary: "What Skillable can tell you about learners, how grading works, and what to say when something goes wrong.", time: "8 min", who: "CSMs" }
      ]
    },

    /* Not shown in the sidebar (hidden: true). Linked from the footer. */
    {
      id: "site",
      title: "About this site",
      hidden: true,
      sequence: false,
      pages: [
        { file: "help/how-to-edit.html", title: "Updating this site", summary: "How to edit a page, add a page and publish.", time: "8 min", who: "Whoever maintains the guides" },
        { file: "help/screenshots.html", title: "Screenshots to take", summary: "The exact screenshots the site is waiting for.", time: "checklist", who: "Whoever maintains the guides" }
      ]
    }
  ]
};
