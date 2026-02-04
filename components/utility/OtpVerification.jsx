import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const OtpVerification = ({ navigation }) => {
    const otpLength = 4; // Change this based on your OTP length
    const [ otp, setOtp ] = useState(new Array(otpLength).fill(''));
    const inputRefs = useRef([]);

    // Handle OTP input change
    const handleChange = (value, index) => {
        if (isNaN(value)) return; // Only allow numbers

        let newOtp = [ ...otp ];
        newOtp[ index ] = value;
        setOtp(newOtp);

        // Move to next input if a number is entered
        if (value && index < otpLength - 1) {
            inputRefs.current[ index + 1 ].focus();
        }
    };

    // Handle backspace
    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && index > 0) {
            let newOtp = [ ...otp ];
            newOtp[ index ] = '';
            setOtp(newOtp);
            inputRefs.current[ index - 1 ].focus();
        }
    };

    // Verify OTP (Mock function)
    const verifyOtp = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== otpLength) {
            Alert.alert('Error', 'Please enter the full OTP.');
            return;
        }
        Alert.alert('Success', `OTP Verified: ${enteredOtp}`);
        navigation.navigate('Home'); // Change this to your desired screen
    };

    // Resend OTP (Mock function)
    const resendOtp = () => {
        Alert.alert('Info', 'New OTP has been sent.');
        setOtp(new Array(otpLength).fill(''));
        inputRefs.current[ 0 ].focus();
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Enter OTP</Text>
            <View style={ styles.otpContainer }>
                { otp.map((digit, index) => (
                    <TextInput
                        key={ index }
                        ref={ (el) => (inputRefs.current[ index ] = el) }
                        style={ styles.otpInput }
                        keyboardType="numeric"
                        maxLength={ 1 }
                        value={ digit }
                        onChangeText={ (value) => handleChange(value, index) }
                        onKeyPress={ (e) => handleKeyPress(e, index) }
                    />
                )) }
            </View>

            <TouchableOpacity style={ styles.button } onPress={ verifyOtp }>
                <Text style={ styles.buttonText }>Verify OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={ resendOtp }>
                <Text style={ styles.resendText }>Resend OTP</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OtpVerification;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#333',
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    resendText: {
        marginTop: 15,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
});
