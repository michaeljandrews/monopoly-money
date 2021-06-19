import React, { useState } from "react";
import { useTitle } from "hookrouter";
import { Form, Button } from "react-bootstrap";
import { createGame, joinGame } from "../../api";
import useStoredGames from "../../hooks/useStoredGames";
import NumberFormat, { NumberFormatValues } from "react-number-format";

interface IJoinProps {
  newGame: boolean;
  onGameSetup: (gameId: string, userToken: string, playerId: string) => void;
}

const Join: React.FC<IJoinProps> = ({ newGame, onGameSetup }) => {
  const title = newGame ? "Create Game" : "Join Game";
  useTitle(`${title} - Monopoly Money`);

  const { storedGames } = useStoredGames(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [gameError, setGameError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // If the game is already stored, join with what we have
  const isAStoredGame = storedGames.map((g) => g.gameId).indexOf(gameId) !== -1;

  const onNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const onSubmit = () => {
    if (isAStoredGame) {
      const storedGame = storedGames.find((g) => g.gameId === gameId)!;
      onGameSetup(storedGame.gameId, storedGame.userToken, storedGame.playerId);
    } else if (newGame) {
      // Validity check
      if (name === "") {
        setNameError("Please provide your name");
        return;
      }
      setNameError(null);

      // Create game
      setLoading(true);
      createGame(name)
        .then((result) => {
          onGameSetup(result.gameId, result.userToken, result.playerId);
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    } else {
      // Validity check
      if (gameId === "") {
        setGameError("Please provide the game Id");
        return;
      }
      setGameError(null);
      if (name === "") {
        setNameError("Please provide your name");
        return;
      }
      setNameError(null);

      // Join game
      setLoading(true);
      joinGame(gameId, name)
        .then((result) => {
          if (result === "DoesNotExist") {
            setGameError("That game does not exist");
          } else if (result === "NotOpen") {
            setGameError("That game is not open. Ask the banker to open the game.");
          } else {
            onGameSetup(result.gameId, result.userToken, result.playerId);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="text-center">
      <h1>{title}</h1>

      {!newGame && (
        <Form.Group>
          <Form.Label>Game Id</Form.Label>
          <NumberFormat
            allowNegative={false}
            format="######"
            placeholder="123456"
            value={gameId}
            onValueChange={({ value }: NumberFormatValues) => setGameId(value)}
            className="form-control text-center"
            autoComplete="off"
            inputMode="decimal"
          />
          <Form.Text style={{ color: "var(--danger)" }}>{gameError}</Form.Text>
        </Form.Group>
      )}

      {isAStoredGame ? (
        <p>
          <em>You're already in this game - name is not required.</em>
        </p>
      ) : (
        <Form.Group>
          <Form.Label>Your Name</Form.Label>
          <Form.Control
            placeholder="Name"
            value={name}
            className="text-center"
            onChange={onNameChange}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
              event.key === "Enter" && onSubmit()
            }
            autoComplete="on"
          />
          <Form.Text style={{ color: "var(--danger)" }}>{nameError}</Form.Text>
        </Form.Group>
      )}

      <Button block variant="primary" onClick={onSubmit} disabled={loading}>
        {newGame ? "Create" : "Join"}
      </Button>
    </div>
  );
};

export default Join;
