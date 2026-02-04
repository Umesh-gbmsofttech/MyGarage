import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Pressable,
} from "react-native";
import React, { useState } from "react";

const Appointment = () => {
  const [carModel, setcarModel] = useState("");
  const [problem, setproblem] = useState("");
  const [date, setdate] = useState("");
  const [time, settime] = useState("");
  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Car Model:</Text>
        <TextInput
          style={styles.input}
          placeholder="enter car model"
          value={carModel}
          onChangeText={setcarModel}
        />
        <Text style={styles.label}>Problem:</Text>
        <TextInput
          style={styles.input}
          placeholder="enter the problem"
          value={problem}
          onChangeText={setproblem}
        />
        <Text style={styles.label}>Date:</Text>
        <TextInput
          style={styles.input}
          placeholder="enter the date"
          value={date}
          onChangeText={setdate}
        />
        <Text style={styles.label}>Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="enter the time"
          value={time}
          onChangeText={settime}
        />
        <Pressable style={styles.btn}>
          <Text style={styles.btntext}>Book</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Appointment;
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    backgroundColor: "#F6F0F0",
  },
  label: {
    paddingLeft: 36,
    fontSize: 20,
    alignSelf: "flex-start",
  },
  input: {
    height: 40,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    width: "80%",
  },
  btn: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    width: 100,
    backgroundColor: "blue",
    alignSelf: "center",
    paddingVertical: 10,
  },
  btntext: {
    color: "white",
  },
});
