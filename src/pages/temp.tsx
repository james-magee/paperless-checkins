import { useRef } from "preact/hooks";
import { csvParse } from "../util/csvparse.ts";

const Start = ({ csvLoad, skip }: any) => {
  const fileInputRef = useRef<any>();

  const handleFileChange = async (event: any) => {
    if (event.target.files.length < 1) return;
    const [file] = event.target.files;
    const content = await file.text();
    csvLoad(csvParse(content));
  };

  return (
    <>
      <div
        style={{
          width: 200,
          height: 200,
          backgroundColor: "orange",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          accept=".csv"
          type="file"
          ref={fileInputRef} // Create a ref to access the input element
          style={{ display: "none" }} // Hide the input visually
          onChange={handleFileChange}
        />
        <div
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              cursor: "grab",
              fontSize: 13,
              fontWeight: 900,
              width: 100,
              backgroundColor: "gray",
              borderRadius: 5,
            }}
          >
            load csv
          </div>
          <div
            onClick={skip}
            id={"skipgamesheets-button"}
            className="hoverfeature"
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginTop: 5,
              cursor: "grab",
            }}
          >
            skip
          </div>
        </div>
      </div>
    </>
  );
};

// const MyButton = ({ children }) => {
//   const [o, setO] = useState(0);

//   return (
//     <div
//       onTouchStart={() => setO(0.2)}
//       onTouchEnd={() => setO(0.0)}
//       style={{
//         zIndex: 100,
//         backgroundColor: "black",
//         opacity: 1,
//       }}
//     >
//       <div>
//         {children}
//       </div>
//     </div>
//   );
// };

export default Start;
