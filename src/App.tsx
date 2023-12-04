import { Dispatch, SetStateAction, useState, ChangeEvent } from "react";
import {
  Button,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { calc, DistFunctions, type Model } from "./calcs";
// calc(1000, 12, 3, [2, 2.5, 3, 3.5, 4], "exp", "exp", "exp", "r", 0.45);

function App() {
  const [fd, setFd] = useState("");
  const [fb, setFb] = useState("");
  const [fa, setFa] = useState("");
  const [pn, setPn] = useState("");
  const [codeLength, setCodeLength] = useState("");
  const [mode, setMode] = useState("");
  const [modeVal, setModeVal] = useState("");
  const [bitCount, setBitCount] = useState("0");
  const [uP, setUP] = useState("");
  const [res, setRes] = useState<Model[] | null>(null);

  const handleSelect =
    (setVal: Dispatch<SetStateAction<string>>) => (e: SelectChangeEvent) =>
      setVal(e.target.value as string);
  const handleInput =
    (setVal: Dispatch<SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setVal(e.target.value);

  return (
    <div>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <TextField
          label={"Кол-во бит для передачи"}
          onChange={handleInput(setBitCount)}
          value={bitCount}
        />
        <InputLabel id="fd">F(d)</InputLabel>
        <Select
          onChange={handleSelect(setFd)}
          value={fd}
          labelId="fd"
          defaultValue="exp"
        >
          <MenuItem value={"exp"}>exp</MenuItem>
          <MenuItem value={"p"}>p</MenuItem>
        </Select>
        <InputLabel id="fb">F(b)</InputLabel>
        <Select
          labelId="fb"
          onChange={handleSelect(setFb)}
          value={fb}
          defaultValue="exp"
        >
          <MenuItem value={"exp"}>exp</MenuItem>
          <MenuItem value={"p"}>p</MenuItem>
        </Select>
        <InputLabel id="fa">F(a)</InputLabel>
        <Select
          labelId={"fa"}
          onChange={handleSelect(setFa)}
          value={fa}
          defaultValue="exp"
        >
          <MenuItem value={"exp"}>exp</MenuItem>
          <MenuItem value={"p"}>p</MenuItem>
        </Select>
        <TextField
          label={
            <span>
              P<sub>n</sub>(+)
            </span>
          }
          onChange={handleInput(setPn)}
          value={pn}
        />
        <TextField
          label={"n"}
          onChange={handleInput(setCodeLength)}
          value={codeLength}
        />
        <InputLabel id="mode">Режим работы</InputLabel>
        <Select
          onChange={handleSelect(setMode)}
          value={mode}
          labelId="mode"
          defaultValue="s"
        >
          <MenuItem value={"s"}>s</MenuItem>
          <MenuItem value={"r"}>r</MenuItem>
        </Select>
        <TextField
          label={""}
          onChange={handleInput(setModeVal)}
          value={modeVal}
        />
        <TextField
          label={"Пороговые значения"}
          onChange={handleInput(setUP)}
          value={uP}
        />
        <Button
          onClick={() =>
            setRes(
              calc(
                +bitCount,
                +codeLength,
                +modeVal,
                uP.split(";").map((i) => +i),
                fd as DistFunctions,
                fb as DistFunctions,
                fa as DistFunctions,
                mode as "s" | "r",
                +pn
              )
            )
          }
        >
          Моделирование
        </Button>
      </Paper>
      {res && (
        <Paper elevation={3} sx={{ marginTop: "1rem" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Uпор</TableCell>
                <TableCell>№ опыта</TableCell>
                <TableCell>Кол-во бит</TableCell>
                <TableCell>Неискаженных бит</TableCell>
                <TableCell>Искаженных бит</TableCell>
                <TableCell>Неискаженных сообщений</TableCell>
                <TableCell>Искаженных сообщений</TableCell>
                <TableCell>P(ош)</TableCell>
                <TableCell>P(1 ош. фикс.)</TableCell>
                <TableCell>P(1 ош. не фикс.)</TableCell>
                <TableCell>Средняя ошибка</TableCell>
                <TableCell>P(сд)</TableCell>
                <TableCell>P(нд)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {res.map((model, i) => (
                <TableRow>
                  <TableCell>{model.U}</TableCell>
                  <TableCell>{i % 2 === 1 ? 2 : 1}</TableCell>
                  <TableCell>{model.N}</TableCell>
                  <TableCell>{model.numGoodBits}</TableCell>
                  <TableCell>{model.numBadBits}</TableCell>
                  <TableCell>{model.numGoodMsgs}</TableCell>
                  <TableCell>{model.numBadMsgs}</TableCell>
                  <TableCell>{model.PErr}</TableCell>
                  <TableCell>{model.PErrT}</TableCell>
                  <TableCell>{model.PGN}</TableCell>
                  <TableCell>{model.ErrMean}</TableCell>
                  <TableCell>{model.PSd}</TableCell>
                  <TableCell>{model.PNd}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  );
}

export default App;
