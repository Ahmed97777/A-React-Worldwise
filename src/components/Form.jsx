// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import Datepicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCitiesContext } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL_TO_FETCH_LOCATION_DATA =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const { createCity, isLoading } = useCitiesContext();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState("");
  const [country, setCountry] = useState("");
  const [cityName, setCityName] = useState("");
  const [lat, lng] = useUrlPosition();
  const [emoji, setEmoji] = useState("");

  useEffect(
    function () {
      if (!lat && !lng) return;

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocodingError("");
          const res = await fetch(
            `${BASE_URL_TO_FETCH_LOCATION_DATA}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          console.log("this is fetched data", data);

          if (!data.countryCode)
            throw new Error("That does not seem to be a city, try again 😉");

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeocodingError(err.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handelSubmit(e) {
    e.preventDefault();

    if (!cityName && !date) return;

    const newCity = {
      date,
      cityName,
      country,
      notes,
      position: { lat, lng },
      emoji,
    };

    await createCity(newCity);
    navigate("/app/cities");
  }

  if (geocodingError) return <Message message={geocodingError} />;

  if (!lat && !lng)
    return <Message message="Start by clicking on the map 😉" />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handelSubmit}
    >
      {isLoadingGeocoding ? (
        <Spinner />
      ) : (
        <>
          <div className={styles.row}>
            <label htmlFor="cityName">City name</label>
            <input
              id="cityName"
              onChange={(e) => setCityName(e.target.value)}
              value={cityName}
            />
            <span className={styles.flag}>{emoji}</span>
          </div>

          <div className={styles.row}>
            <label htmlFor="date">When did you go to {cityName}?</label>

            <Datepicker
              id="date"
              selected={date}
              onChange={(date) => setDate(date)}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div className={styles.row}>
            <label htmlFor="notes">Notes about your trip to {cityName}</label>
            <textarea
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              value={notes}
            />
          </div>

          <div className={styles.buttons}>
            {/* <button>&larr; Back</button> */}
            <BackButton />

            {/* <button>Add</button> */}
            <Button type="primary">Add</Button>
          </div>
        </>
      )}
    </form>
  );
}

export default Form;
