import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useLayoutEffect, useState } from 'react';
import { Dimensions, Keyboard, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import DoItYourself from '../../app/doItYourself/index';
import Footer from '../footer/Footer';
import OurMechanics from '../mechanic/OurMechanics';
import TopMechanics from '../mechanic/TopMechanics';
import ChatContactUs from '../utility/chat/ChatContactUs';
import MenuPanel from '../utility/MenuPanel'; // Import here
import NavSearchBar from '../utility/NavSearchBar';
import RatingReviewSection from '../utility/RatingReviewSection';


const Home = () => {
    const navigation = useNavigation();
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [ navigation ]);

    return (
        <View style={ styles.container }>
            <StatusBar hidden={ true } />
            <ScrollView scrollEnabled={ !isMenuOpen }>
                <NavSearchBar isMenuOpen={ isMenuOpen } setIsMenuOpen={ setIsMenuOpen } />
                <TopMechanics />
                <OurMechanics />
                <DoItYourself />
                <RatingReviewSection />
                <Footer />
            </ScrollView>
            <ChatContactUs />

            {/* Overlay MenuPanel (outside ScrollView!) */ }
            { isMenuOpen && (
                <View style={ styles.menuOverlayContainer }>
                    <TouchableWithoutFeedback onPress={ Keyboard.dismiss }>
                        <View style={ styles.backdrop } />
                    </TouchableWithoutFeedback>
                    <MenuPanel onClose={ () => setIsMenuOpen(false) } />
                </View>
            ) }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    menuOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flexDirection: 'row',
        zIndex: 999,
        elevation: 10,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default Home;
