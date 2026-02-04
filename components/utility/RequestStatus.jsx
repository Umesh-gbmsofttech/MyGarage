import { StyleSheet, Text, View } from "react-native";

const RequestStatus = () => {
    const carModel = "Tesla Model S";
    const problem = "Flat tire";
    const dateTime = "11/03/25 & 10:00 AM";
    const city = "Pune";

    return (
        <View style={ styles.container }>
            <Text style={ styles.heading }>Request Status:</Text>
            <View style={ styles.dataContainer }>
                <View style={ styles.row }>
                    <Text style={ styles.label }>Car Model:</Text>
                    <Text style={ styles.value }>{ carModel }</Text>
                </View>
                <View style={ styles.row }>
                    <Text style={ styles.label }>Problem:</Text>
                    <Text style={ styles.value }>{ problem }</Text>
                </View>
                <View style={ styles.row }>
                    <Text style={ styles.label }>Date and Time:</Text>
                    <Text style={ styles.value }>{ dateTime }</Text>
                </View>
                <View style={ styles.row }>
                    <Text style={ styles.label }>City:</Text>
                    <Text style={ styles.value }>{ city }</Text>
                </View>
                <View style={ styles.row }>
                    <Text style={ styles.label }>Status:</Text>
                    <Text style={ styles.value }>
                        <Text style={ { color: 'green' } }>Accepted</Text>
                        <Text style={ { color: 'red' } }>/Declined</Text>
                        <Text style={ { color: 'orange' } }>/Pending</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default RequestStatus;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
    },
    heading: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: 800,
        marginBottom: 10,
    },
    dataContainer: {
        backgroundColor: "#A2F2F2",
        padding: 20,
        width: "90%",
        borderRadius: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    label: {
        //color: "white",
    },
    value: {
        fontWeight: "bold",
    },
});
