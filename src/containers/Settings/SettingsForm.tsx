import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import * as storage from "../../hooks/useLocalStorage";

type Props = {
  onComplete: () => void;
};

export function SettingsForm(props: Props) {
  const [selectedLetters, setSelectedLetters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setSelectedLetters(storage.getLetters());
  }, []);

  const onChange = useCallback(
    (letter: string, checked: boolean) => {
      setSelectedLetters({
        ...selectedLetters,
        [letter]: checked,
      });
    },
    [selectedLetters]
  );

  const validSettings =
    Object.values(selectedLetters).length === 0 ||
    Object.values(selectedLetters).filter((it) => it).length > 0;
  const first = Object.entries(selectedLetters).slice(0, 10);
  const second = Object.entries(selectedLetters).slice(10, 20);
  const third = Object.entries(selectedLetters).slice(20);
  return (
    <Form style={{ overflow: "auto" }}>
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col lg="2"></Col>

          <Col xs lg="4" className="mt-3">
            <div style={{ height: "50px" }}></div>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col lg="3"></Col>

          <Col xs lg="6" className="mb-3" style={{ textAlign: "center" }}>
            <h2>
              <i className="bi bi-list-check"></i> Velg bokstaver
            </h2>
            <AlertDismissibleExample title="Ugyldig" show={!validSettings}>
              Ingen bokstaver er valgt. Velg minst 1 bokstav.
            </AlertDismissibleExample>
          </Col>
          <Col lg="3"></Col>
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
                onClick={() => {
                  setSelectedLetters(storage.getLetters());
                  props.onComplete();
                }}
                style={{ width: "100%" }}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                disabled={!validSettings}
                onClick={() => {
                  if (validSettings) {
                    storage.saveLetters(selectedLetters);
                    props.onComplete();
                  }
                }}
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
        marginLeft: "-1.3rem",
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

type AlertProps = {
  title: string;
  show: boolean;
  children: React.ReactNode;
};

function AlertDismissibleExample(props: AlertProps) {
  if (props.show) {
    return (
      <Alert variant="danger">
        <Alert.Heading>{props.title}</Alert.Heading>
        {props.children}
      </Alert>
    );
  }

  return null;
}
