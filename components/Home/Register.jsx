import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import React, { useState } from "react";

const Register = () => {
  const [hoverButton, sethoverButton] = useState(null);

  const handlePress = (buttonType) => {
    Alert.alert(`${buttonType} clicked`);
  };

  return (
    <View style={styles.contentContainer}>
      <View style={styles.container}>
        <View style={styles.btnContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.heading}>Register Now</Text>
          </View>
          <Pressable
            onPress={() => handlePress("Owner")}
            onPressIn={() => sethoverButton("owner")}
            onPressOut={() => sethoverButton(null)}
            style={[styles.btn, hoverButton === "owner" && styles.hoverbtn]}
          >
            <Text style={styles.btnText}>Car Owner</Text>
          </Pressable>

          <Pressable
            onPress={() => handlePress("Mechanic")}
            onPressIn={() => sethoverButton("mechanic")}
            onPressOut={() => sethoverButton(null)}
            style={[styles.btn, hoverButton === "mechanic" && styles.hoverbtn]}
          >
            <Text style={styles.btnText}>Mechanic</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingBottom: 30,
    justifyContent: "center",
  },
  container: {
    padding: 30,
  },
  heading: {
    fontWeight: 400,
    fontSize: 30,
    textAlign: "center",
  },
  textContainer: {
    paddingTop: 60,
  },
  btnContainer: {
    padding: 40,
    backgroundColor: "#E0FFFF",
    marginTop: 20,
    height: "100%",
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  btn: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    width: 200,
  },
  btnText: {
    textAlign: "center",
    fontSize: 20,
  },
  hoverbtn: {
    borderColor: "blue",
    borderWidth: 3,
  },
});

export default Register;
