import { useCallback, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";

interface SaveOptions {
  letters: Record<string, boolean>;
}

type Props = {
  letters: Record<string, boolean>;
  onSave: (options: SaveOptions) => void;
  onAbort: () => void;
};

export function SettingsForm(props: Props) {
  const [selectedLetters, setSelectedLetters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setSelectedLetters(props.letters);
  }, [props.letters]);

  const onChange = useCallback(
    (letter: string, checked: boolean) => {
      setSelectedLetters({
        ...selectedLetters,
        [letter]: checked,
      });
    },
    [selectedLetters]
  );

  const first = Object.entries(selectedLetters).slice(0, 10);
  const second = Object.entries(selectedLetters).slice(10, 20);
  const third = Object.entries(selectedLetters).slice(20);
  return (
    <Form style={{ overflow: "auto" }}>
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col lg="2"></Col>

          <Col xs lg="4" className="mb-3">
            <h1>Innstillinger</h1>
          </Col>
        </Row>
        <Row>
          <Col lg="3"></Col>

          <Col xs lg="3" className="mb-3">
            <h2>
              <i className="bi bi-list-check"></i> Bokstaver
            </h2>
            <blockquote>Velg bokstaver som kan bli valgt.</blockquote>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <LetterCol onChange={onChange} letters={first} />
          <LetterCol onChange={onChange} letters={second} />
          <LetterCol onChange={onChange} letters={third} />
        </Row>
        <Row className="justify-content-md-center mb-10">
          <Col
            xs
            lg="6"
            className="mb-3"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ButtonGroup style={{ width: "100%" }}>
              <Button
                variant="dark"
                onClick={props.onAbort}
                style={{ width: "100%" }}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={() => props.onSave({ letters: selectedLetters })}
                style={{ width: "100%" }}
              >
                Lagre
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <div style={{ height: "100px" }}></div>
        </Row>
      </Container>
    </Form>
  );
}

type LetterColProps = {
  letters: [string, boolean][];
  onChange: (letter: string, checked: boolean) => void;
};

function LetterCol(props: LetterColProps) {
  return (
    <Col
      xs
      lg="2"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {props.letters.map(([letter, checked]) => (
        <Form.Group
          key={letter}
          className="mb-3"
          controlId={`formCheckbox${letter}`}
        >
          <Form.Check
            style={{ fontSize: "1.6rem", width: "1rem" }}
            key={`letter-checkbox-${letter}`}
            type="switch"
            label={letter}
            checked={checked}
            onChange={() => props.onChange(letter, !checked)}
          />
        </Form.Group>
      ))}
    </Col>
  );
}
