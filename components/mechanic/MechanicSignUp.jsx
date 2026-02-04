import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";

const MechanicSignUp = () => {
  const [mechName, setmechName] = useState("");
  const [surname, setsurname] = useState("");
  const [mobile, setmobile] = useState("");
  const [email, setemail] = useState("");
  const [experience, setexperience] = useState("");
  const [speciality, setspeciality] = useState("");
  const [city, setcity] = useState("");
  const [shopAct, setshopAct] = useState("");

  const handleSubmit = () => {
    // Validation
    if (
      !mechName ||
      !surname ||
      !mobile ||
      !email ||
      !experience ||
      !speciality ||
      !city ||
      !shopAct
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    Alert.alert("Success", "mechanic Sign Up Successful");

    setmechName("");
    setsurname("");
    setmobile("");
    setemail("");
    setexperience("");
    setspeciality("");
    setcity("");
    setshopAct("");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Mechanic SignUp</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="enter your name"
            value={mechName}
            onChangeText={setmechName}
          />

          <Text style={styles.label}> surname</Text>

          <TextInput
            style={styles.input}
            placeholder="enter your surname"
            value={surname}
            onChangeText={setsurname}
          />

          <Text style={styles.label}>mobile number</Text>

          <TextInput
            style={styles.input}
            placeholder="enter your mobile number"
            value={mobile}
            onChangeText={setmobile}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="enter the email id"
            value={email}
            onChangeText={setemail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Experience</Text>

          <TextInput
            style={styles.input}
            placeholder="enter the your experience"
            value={experience}
            onChangeText={setexperience}
          />

          <Text style={styles.label}>specialities</Text>

          <TextInput
            style={styles.input}
            placeholder="enter your main speciality"
            value={speciality}
            onChangeText={setspeciality}
          />

          <Text style={styles.label}>City</Text>

          <TextInput
            style={styles.input}
            placeholder="enter your city"
            value={city}
            onChangeText={setcity}
          />

          <Text style={styles.label}>shop Act</Text>

          <TextInput
            style={styles.input}
            placeholder="upload file"
            value={shopAct}
            onChangeText={setshopAct}
          />

          <Button title="Sign up" onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
};

export default MechanicSignUp;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30, // Extra space for the button
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  btn: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "blue",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  form: {
    backgroundColor: "#FFF0F5",
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
});
