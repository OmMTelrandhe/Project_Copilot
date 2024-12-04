// "use client";
// import "@copilotkit/react-ui/styles.css";

// import React, { useState } from "react";
// import Sidebar from "./components/Sidebar";
// import SingleSpreadsheet from "./components/SingleSpreadsheet";
// import {
//   CopilotKit,
//   useCopilotAction,
//   useCopilotReadable,
// } from "@copilotkit/react-core";
// import { CopilotSidebar } from "@copilotkit/react-ui";
// import { INSTRUCTIONS } from "./instructions";
// import { canonicalSpreadsheetData } from "./utils/canonicalSpreadsheetData";
// import { SpreadsheetData } from "./types";
// import { PreviewSpreadsheetChanges } from "./components/PreviewSpreadsheetChanges";

// const HomePage = () => {
//   return (
//     <CopilotKit
//       publicApiKey={process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY}
//       // Alternatively, you can use runtimeUrl to host your own CopilotKit Runtime
//       runtimeUrl="/api/copilotkit"
//       transcribeAudioUrl="/api/transcribe"
//       textToSpeechUrl="/api/tts"
//     >
//       <CopilotSidebar
//         instructions={INSTRUCTIONS}
//         labels={{
//           initial: "Welcome to the spreadsheet app! How can I help you?",
//         }}
//         defaultOpen={true}
//         clickOutsideToClose={false}
//       >
//         <Main />
//       </CopilotSidebar>
//     </CopilotKit>
//   );
// };

// const Main = () => {
//   const [spreadsheets, setSpreadsheets] = React.useState<SpreadsheetData[]>([
//     {
//       title: "Spreadsheet 1",
//       rows: [
//         [{ value: "" }, { value: "" }, { value: "" }],
//         [{ value: "" }, { value: "" }, { value: "" }],
//         [{ value: "" }, { value: "" }, { value: "" }],
//       ],
//     },
//   ]);

//   const [selectedSpreadsheetIndex, setSelectedSpreadsheetIndex] = useState(0);

//   useCopilotAction({
//     name: "createSpreadsheet",
//     description: "Create a new  spreadsheet",
//     parameters: [
//       {
//         name: "rows",
//         type: "object[]",
//         description: "The rows of the spreadsheet",
//         attributes: [
//           {
//             name: "cells",
//             type: "object[]",
//             description: "The cells of the row",
//             attributes: [
//               {
//                 name: "value",
//                 type: "string",
//                 description: "The value of the cell",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         name: "title",
//         type: "string",
//         description: "The title of the spreadsheet",
//       },
//     ],
//     render: (props) => {
//       const { rows, title } = props.args;
//       const newRows = canonicalSpreadsheetData(rows);

//       return (
//         <PreviewSpreadsheetChanges
//           preCommitTitle="Create spreadsheet"
//           postCommitTitle="Spreadsheet created"
//           newRows={newRows}
//           commit={(rows) => {
//             const newSpreadsheet: SpreadsheetData = {
//               title: title || "Untitled Spreadsheet",
//               rows: rows,
//             };
//             setSpreadsheets((prev) => [...prev, newSpreadsheet]);
//             setSelectedSpreadsheetIndex(spreadsheets.length);
//           }}
//         />
//       );
//     },
//     handler: ({ rows, title }) => {
//       // Do nothing.
//       // The preview component will optionally handle committing the changes.
//     },
//   });

//   useCopilotReadable({
//     description: "Today's date",
//     value: new Date().toLocaleDateString(),
//   });

//   return (
//     <div className="flex">
//       <Sidebar
//         spreadsheets={spreadsheets}
//         selectedSpreadsheetIndex={selectedSpreadsheetIndex}
//         setSelectedSpreadsheetIndex={setSelectedSpreadsheetIndex}
//       />
//       <SingleSpreadsheet
//         spreadsheet={spreadsheets[selectedSpreadsheetIndex]}
//         setSpreadsheet={(spreadsheet) => {
//           setSpreadsheets((prev) => {
//             console.log("setSpreadsheet", spreadsheet);
//             const newSpreadsheets = [...prev];
//             newSpreadsheets[selectedSpreadsheetIndex] = spreadsheet;
//             return newSpreadsheets;
//           });
//         }}
//       />
//     </div>
//   );
// };

// export default HomePage;




"use client";
import "@copilotkit/react-ui/styles.css";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SingleSpreadsheet from "./components/SingleSpreadsheet";
import { ActionRenderProps, CopilotKit, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { INSTRUCTIONS } from "./instructions";
import { canonicalSpreadsheetData } from "./utils/canonicalSpreadsheetData";
import { SpreadsheetData } from "./types";
import { PreviewSpreadsheetChanges } from "./components/PreviewSpreadsheetChanges";

const HomePage = () => {
  return (
    <CopilotKit
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY}
      runtimeUrl="/api/copilotkit"
      transcribeAudioUrl="/api/transcribe"
      textToSpeechUrl="/api/tts"
    >
      <CopilotSidebar
        instructions={INSTRUCTIONS}
        labels={{
          initial: "Welcome to the spreadsheet app! How can I help you?",
        }}
        defaultOpen={true}
        clickOutsideToClose={false}
      >
        <Main />
      </CopilotSidebar>
    </CopilotKit>
  );
};

const Main = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([
    {
      title: "Spreadsheet 1",
      rows: [
        [{ value: "" }, { value: "" }, { value: "" }],
        [{ value: "" }, { value: "" }, { value: "" }],
        [{ value: "" }, { value: "" }, { value: "" }],
      ],
    },
  ]);

  const [selectedSpreadsheetIndex, setSelectedSpreadsheetIndex] = useState(0);

  useCopilotAction({
    name: "createSpreadsheet",
    description: "Create a new spreadsheet",
    parameters: [
      {
        name: "rows",
        type: "object[]",
        description: "The rows of the spreadsheet",
        attributes: [
          {
            name: "cells",
            type: "object[]",
            description: "The cells of the row",
            attributes: [
              {
                name: "value",
                type: "string",
                description: "The value of the cell",
              },
            ],
          },
        ],
      },
      {
        name: "title",
        type: "string",
        description: "The title of the spreadsheet",
      },
    ],
    render: (
      props: ActionRenderProps<
        [
          {
            readonly name: "rows";
            readonly type: "object[]";
            readonly description: "The rows of the spreadsheet";
            readonly attributes: [
              {
                readonly name: "cells";
                readonly type: "object[]";
                readonly description: "The cells of the row";
                readonly attributes: [
                  {
                    readonly name: "value";
                    readonly type: "string";
                    readonly description: "The value of the cell";
                  }
                ];
              }
            ];
          },
          {
            readonly name: "title";
            readonly type: "string";
            readonly description: "The title of the spreadsheet";
          }
        ]
      >
    ) => {
      const { args } = props;
      const { rows, title } = args || {};
      const newRows = canonicalSpreadsheetData(rows);

      return (
        <PreviewSpreadsheetChanges
          preCommitTitle="Create spreadsheet"
          postCommitTitle="Spreadsheet created"
          newRows={newRows}
          commit={(rows) => {
            const newSpreadsheet: SpreadsheetData = {
              title: title || `Spreadsheet ${spreadsheets.length + 1}`,
              rows: rows,
            };
            setSpreadsheets((prev) => [...prev, newSpreadsheet]);
            setSelectedSpreadsheetIndex(spreadsheets.length);
          }}
        />
      );
    },
    handler: ({}) => {
      // Do nothing.
      // The preview component will optionally handle committing the changes.
    },
  });

  useCopilotReadable({
    description: "Today's date",
    value: new Date().toLocaleDateString(),
  });

  // Function to add a new blank spreadsheet
  const addNewSpreadsheet = () => {
    const newSpreadsheet: SpreadsheetData = {
      title: `Spreadsheet ${spreadsheets.length + 1}`,
      rows: [
        [{ value: "" }, { value: "" }, { value: "" }],
        [{ value: "" }, { value: "" }, { value: "" }],
        [{ value: "" }, { value: "" }, { value: "" }],
      ],
    };
    setSpreadsheets((prev) => [...prev, newSpreadsheet]);
    setSelectedSpreadsheetIndex(spreadsheets.length); // Select the newly created spreadsheet
  };

  return (
    <div className="flex">
      <Sidebar
        spreadsheets={spreadsheets}
        selectedSpreadsheetIndex={selectedSpreadsheetIndex}
        setSelectedSpreadsheetIndex={setSelectedSpreadsheetIndex}
        addNewSpreadsheet={addNewSpreadsheet} // Pass the new function
      />
      <SingleSpreadsheet
        spreadsheet={spreadsheets[selectedSpreadsheetIndex]}
        setSpreadsheet={(spreadsheet) => {
          setSpreadsheets((prev) => {
            const newSpreadsheets = [...prev];
            newSpreadsheets[selectedSpreadsheetIndex] = spreadsheet;
            return newSpreadsheets;
          });
        }}
      />
    </div>
  );
};

export default HomePage;
