import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';

const HelpScreen = () => {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleItem = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const data = [
    {
      title: "Logowanie / Rejestracja",
      content: (
        <View>
          <Text style={styles.contentText}>
    Aby się zalogować, należy nacisnąć ikonę 3 pasków w lewym górnym rogu rozwijanego menu i wybrać opcję "ZALOGUJ SIĘ".
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz1.jpg')} 
          />
          <Text style={styles.contentText}>
Należy uzupełnić wszystkie pola i nacisnąć "Zaloguj się". Jeśli konto nie istnieje, należy wybrać opcję "Zarejstruj się".
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz2.jpg')} 
          />
                    <Text style={styles.contentText}>
Aby zarejstrować nowe konto, należy wypełnić wszystkie pola i nacisnąć "Zarejstruj się". Następnie nastąpi przekierowanie na stronę logowania.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz3.jpg')} 
          />
        </View>
      ),
    },
    {
      title: "Ekran główny",
      content: (
        <View>
          <Text style={styles.contentText}>
         Ekran główny składa się z 3 kafelków, aktualizowanych po dodaniu danych przez użytkownika. W przypadku pojazdu i pogody, należy wybrać interesujące nas kafelki 'checkboxem'.
         w prawym górnym rogu znajduje się dzwonek, wyświetlający przypomnienia o zbliżającym się ubezpieczeniu lub przeglądzie pojazdu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz4.jpg')} 
          />
          <Text style={styles.contentText}>
      Przykład przypomnienia:
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz10.jpg')} 
          />
        </View>
      ),
    },
    {
      title: "Pojazdy i ich dodawanie",
      content: (
        <View>
          <Text style={styles.contentText}>
         Ekran pojazdów, składa się z kafelków dla każdego dodanego pojazdu. Aby pojazd był wyświetlany na ekranie głownym, oraz aby później dodać koszt dla danego pojazdu, musi być on zaznaczony checkboxem w prawym górnym rogu kafelka.
         Pod ikoną 3 kropek znajdują się funkcje, takie jak edycja, usuwanie i dodawanie przypomnienia.
         Aby dodać nowy pojazd, należy nacisnąć ikonę plusa w prawym górnym rogu ekranu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz5.jpg')} 
          />
          <Text style={styles.contentText}>
      Aby dodać pojazd, należy wypełnić wszystkie pola, opcjonalnie można wybrać własne zdjęcie. Aby to zrobić, trzeba nacisnąć ikonę 3 kropek na kafelku podglądu pojazdu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz6.jpg')} 
          />
           <Text style={styles.contentText}>
    Edytowanie pojazdu działa analogicznie jak jego dodawanie.
          </Text>
        </View>
      ),
    },
    {
      title: "Przypomnienia i ich dodawanie",
      content: (
        <View>
          <Text style={styles.contentText}>
          Po wejściu w wyżej wspomniane powiadomienia, ukaże się ekran, na którym będą się wyświetlać przypomnienia, czyli kafelki z danymi na temat przeglądów i ubezpieczenia. Pod ikoną 3 kropek kryje się opcja usuwania. Aby dodać przypomnienie, należy nacisnąć plus w prawym górnym rogu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz7.jpg')} 
          />
          <Text style={styles.contentText}>
          Aby dodać przypomnienie, należy uzupełnić wszystkie pola. W polu "przypomnienie przed upływem", zaznaczamy ile dni przed końcem, chcemy dostać przypomnienie na ekran głowny pod ikoną dzwonka.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz8.jpg')}
          />
        </View>
      ),
    },
    {
      title: "Koszty i ich dodawanie",
      content: (
        <View>
          <Text style={styles.contentText}>
Ekran kosztów składa się z kafelków. Pod ikoną 3 kropek kryją się opcje usuwania i edycji. Aby dodać koszt nalezy nacisnąć plusa w prawym górnym rogu. 
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz11.jpg')} 
          />
          <Text style={styles.contentText}>
          Przed dodaniem kosztu, należy zaznaczyć 'checkboxem' wybrany pojazd na ekranie Pojazdy. Aby dodać koszt, należy uzupełnić wszystkie pola. Zdjęcie poglądowe danej kategorii zmieni się automatycznie.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz12.jpg')} 
          />
          <Text style={styles.contentText}>
  Edytowanie kosztu działa analogicznie jak jego dodawanie.
          </Text>
        </View>
      ),
    },
    {
      title: "Trasy i ich rejestrowanie",
      content: (
        <View>
          <Text style={styles.contentText}>
Ekran tras składa się z kafelków. Pod ikoną 3 kropek kryją się opcje widoku szczegółów oraz usunięcia. Aby dodać trasę, należy nacisnąć plusa w prawym górnym rogu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz13.jpg')} 
          />
          <Text style={styles.contentText}>
Na górze ekranu rejestracji trasy widnieje wskaźnik pochylenia motocykla, poniżej takie informacje jak stan GPS, czas i dystans. W środkowej sekcji jest prędkościomierz. Na dole przyciski do rozpoczęcia i zakończenia rejstracji trasy, do otwarcia mapy oraz do kalibracji czujnika pochyłu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz14.jpg')} 
          />
          <Text style={styles.contentText}>
Po otwarciu szczegółów trasy, możemy podejrzeć wszystkie parametry wraz z podglądem całej mapy.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz15.jpg')} 
          />
        </View>
      ),
    },
    {
      title: "Prognoza pogody i jej dodawanie",
      content: (
        <View>
          <Text style={styles.contentText}>
Ekran pogody składa się z kafelków zawierających prognoze pogody. Pod ikoną 3 kropek widnieją opcje usuwania oraz szczegółów wyświetlających pogodę na 5 dni. Zaznaczenie kafelka 'checkboxem' spowoduje wyświetlanie tego miasta na ekranie głównym. Panel dodawania miasta znajduje się pod plusem w prawym górnym rogu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz16.jpg')}
          />
          <Text style={styles.contentText}>
Po wejściu w szczegóły ukazuje się nam szczegółowa prognoza na 5 dni dla danego miasta. 
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz17.jpg')}
          />
        </View>
      ),
    },
    {
      title: "Eksport / Import danych",
      content: (
        <View>
          <Text style={styles.contentText}>
W sekcji Eksport / Import danych, istnieje możliwość eksportu danych całej aplikacji w celu zrobienia kopii zapasowej, aby wynonać eksport, należy nacisnąć odpowiedni przycisk oraz zapisać plik CSV w dogodnym miejscu.
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/help/Obraz18.jpg')} 
          />
          <Text style={styles.contentText}>
Aby dokonać importu, należy nacisnąć odpowiedni przycisk i wybrać wcześniej wyeksportowany plik w formacie CSV.
          </Text>
      
        </View>
      ),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pomoc</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.accordionContainer}>
          <TouchableOpacity onPress={() => toggleItem(index)} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>{item.title}</Text>
          </TouchableOpacity>
          {expandedItem === index && (
            <View style={styles.accordionContent}>
              {item.content}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  accordionContainer: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
  },
  accordionHeader: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
  },
  accordionTitle: {
    color: '#fff',
    fontSize: 18,
  },
  accordionContent: {
    padding: 15,
    backgroundColor: '#2a2a2a',
  },
  contentText: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: Dimensions.get('window').width - 32,
    height: (Dimensions.get('window').width - 32) * 1.77,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
    alignSelf: 'center'
  },
});

export default HelpScreen;
