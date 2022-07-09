import {View, ScrollView, Image, StyleSheet} from 'react-native';
import React, {useState} from 'react';

import {Button} from '@rneui/base';
import {Text} from '@rneui/themed';
import {Overlay, Dialog, ListItem, Badge, Icon} from '@rneui/themed';

const TutorialDialog = ({showTutorial, setShowTutorial}) => {
  const [exp1, setExp1] = useState(false);
  const [exp2, setExp2] = useState(false);
  const [exp3, setExp3] = useState(false);
  const [exp4, setExp4] = useState(false);
  const [exp5, setExp5] = useState(false);
  const [exp6, setExp6] = useState(false);
  const [exp7, setExp7] = useState(false);
  const [exp8, setExp8] = useState(false);

  return (
    <Dialog
      overlayStyle={{width: '90%', maxHeight: '90%'}}
      isVisible={showTutorial}
      animationType="fade"
      onBackdropPress={() => {
        setShowTutorial(false);
      }}>
      <ScrollView>
        <View>
          <Text h3 h3Style={{textAlign: 'center'}}>
            Benvenuto su Mordle
          </Text>

          <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold'}}>
            More than Wordle!
          </Text>

          <Text
            style={{fontSize: 17, marginVertical: '4%', textAlign: 'justify'}}>
            Mordle ti permette di giocare e sfidare Online i tuoi amici a
            indovinare delle parole attraverso il classico gioco 'Wordle'.
          </Text>
          <Text style={{fontSize: 17, marginBottom: '4%'}}>
            Qui sotto puoi trovare come funzionano le diverse modalita' di
            gioco.
          </Text>
        </View>

        <ListItem.Accordion
          isExpanded={exp1}
          onPress={() => {
            setExp1(!exp1);
          }}
          content={
            <>
              <Icon
                name="plus-circle"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Creare partite
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Quando crei una partita, puoi scegliere il numero di giocatori
              (minimo 2, massimo 5), il numero di parole (minimo 3, massimo 10)
              e la lunghezza di ciascuna parola (4, 5 o 6 lettere).
            </Text>
            <Text style={styles.middlePar}>
              Opzionalmente puoi aggiungere una password per rendere la partita
              privata.
            </Text>
            <Text style={styles.lastPar}>
              Una volta creata la partita, verrai portato nella sala d'attesa!
            </Text>
            <Image
              source={require('../helper/img1.jpg')}
              style={{borderWidth: 2, borderColor: '#6a6a6a', borderRadius: 20}}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp2}
          onPress={() => {
            setExp2(!exp2);
          }}
          content={
            <>
              <Icon
                name="magnify"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Unirti a una partita
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Per unirti ad una partita gia' esistente, apri il pannello per la
              ricerca e scegli tra i match disponibili
            </Text>
            <Text style={styles.middlePar}>
              Per ogni partita e' indicato l'utente che l'ha creata (l'host), il
              numero di giocatori necessari, il numero di parole e la loro
              lunghezza. E' inoltre mostrato il numero di giocatori attualmente
              presenti nella stanza d'attesa.
            </Text>
            <Text style={styles.lastPar}>
              Se il lucchetto e' chiuso, significa che la partita e' privata e
              ti verra' chiesta la password.
            </Text>
            <Image
              source={require('../helper/img2.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp3}
          onPress={() => {
            setExp3(!exp3);
          }}
          content={
            <>
              <Icon
                name="clock-outline"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Sala d'attesa
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Nella sala d'attesa dovrai aspettare che la partita venga
              cominciata. Se hai creato la partita, una volta raggiunto il
              numero sufficente di giocatori, dovrai premere il bottone in fondo
              al pannello <Text style={styles.bold}>'Partita'</Text> per far
              partire il gioco per tutti.
            </Text>
            <Text style={styles.lastPar}>
              Nel frattempo potrai usare il pannello{' '}
              <Text style={styles.bold}>'Chat'</Text> per chattare con gli altri
              giocatori presenti nella stanza oppure usare il pannello
              <Text style={styles.bold}> 'Giocatori' </Text>
              per inviare e accettare richieste di amicizia.
            </Text>
            <Image
              source={require('../helper/img3.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp4}
          onPress={() => {
            setExp4(!exp4);
          }}
          content={
            <>
              <Icon
                name="alpha-a-box-outline"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Giocare la partita
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Cominciata la partita, dovrai provare a indovinare la parola. Hai
              ha dispizione <Text style={styles.bold}>6 tentativi</Text> e{' '}
              <Text style={styles.bold}>3 minuti</Text> per indovinarla.
            </Text>
            <Text style={styles.middlePar}>
              Mano a mano che farai tentativi, la griglia superiore ti
              indichera' quali lettere non sono presenti nella parola{' '}
              <Text style={styles.bold}>(grigio)</Text>, quali sono presenti ma
              nella posizione sbagliata{' '}
              <Text style={styles.bold}>(giallo)</Text> e quali lettere sono
              presenti e sono nella posizione corretta{' '}
              <Text style={styles.bold}>(verde)</Text>.
            </Text>
            <Text style={styles.middlePar}>
              La tastiera riflettera' questi cambiamenti e disattivera' le
              lettere grigie.
            </Text>
            <Text style={styles.middlePar}>
              Quando avrai indovinato (o sbagliato) la parola, verrai portati
              alla pagina successiva, dove proverai ad indovinare la nuova
              parola.
            </Text>
            <Text style={styles.attention}>
              <Text style={styles.bold}>ATTENZIONE:</Text> Se uscirai dall'app
              mentre provi a indovinare la parola, abbandonerai la partita!
            </Text>
            <Image
              source={require('../helper/img4.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'stretch',
              }}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp5}
          onPress={() => {
            setExp5(!exp5);
          }}
          content={
            <>
              <Icon
                name="podium-gold"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Fine partita
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Quando tutti i giocatori avranno finito di indovinare ogni parola
              (o avranno abbandonato la partita), potrai vedere la tua posizione
              nella classifica!
            </Text>
            <Text style={styles.lastPar}>
              Potrai sapere quanti giocatori hai battuto e quanto tempo hai
              impiegato per indovinare le parole.
            </Text>
            <Image
              source={require('../helper/img5.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp6}
          onPress={() => {
            setExp6(!exp6);
          }}
          content={
            <>
              <Icon
                name="boxing-glove"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>Sfide</ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Le sfide sono un altra modalita' di gioco, dove puoi scegliere una
              parola e sfidare i tuoi amici ad indovinarla!
            </Text>
            <Text style={styles.attention}>
              <Text style={styles.bold}>ATTENZIONE: </Text>Puoi lanciare e
              ricevere sfide solo con tuoi amici
            </Text>
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp7}
          onPress={() => {
            setExp7(!exp7);
          }}
          content={
            <>
              <Icon
                name="sword"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Lanciare sfide
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Nella sezione <Text style={styles.bold}>Sfide</Text> hai a
              diposizione il pannello{' '}
              <Text style={styles.bold}>Lancia sfida</Text> per poter sfidare i
              tuoi amici!
            </Text>
            <Text style={styles.middlePar}>
              Premi sul pulsante <Text style={styles.bold}>Sfida</Text> sotto
              l'amico che vuoi sfidare. Ti verra' chiesta la parola che vuoi che
              indovini (deve essere di 4, 5 o 6 lettere) e quanto tempo vuoi
              concedere (minimo 3 minuti, massimo 15 minuti)
            </Text>
            <Text style={styles.attention}>
              <Text style={styles.bold}>ATTENZIONE: </Text>Ad ogni amico puoi
              lanciare al massimo una sfida alla volta. Dovrai aspettare le
              abbia completato la tua sfida per lanciarne un'altra.
            </Text>
            <Image
              source={require('../helper/img6.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </ListItem.Accordion>

        <ListItem.Accordion
          isExpanded={exp8}
          onPress={() => {
            setExp8(!exp8);
          }}
          content={
            <>
              <Icon
                name="sword-cross"
                type="material-community"
                containerStyle={{marginRight: '2%'}}
              />
              <ListItem.Content>
                <ListItem.Title style={{fontSize: 17}}>
                  Affrontare sfide
                </ListItem.Title>
              </ListItem.Content>
            </>
          }>
          <View>
            <Text style={styles.firstPar}>
              Nel pannello <Text style={styles.bold}>Sfide ricevute</Text> puoi
              vedere le sfide che hai affrontato in passato e il loro risultato.
            </Text>
            <Text style={styles.middlePar}>
              Puoi inoltre affrontare le sfide che ti sono state lanciate.
            </Text>
            <Text style={styles.attention}>
              <Text style={styles.bold}>ATTENZIONE: </Text>Uscire da una sfida
              mentre la stai affrontando ti fara' automaticamente perdere.
            </Text>
            <Text style={styles.lastPar}>
              Infine nel pannello{' '}
              <Text style={styles.bold}>Sfide lanciate</Text> puoi visualizzare
              le sfide che hai lanciato in passato e il loro risultato.
            </Text>
            <Image
              source={require('../helper/img7.jpg')}
              style={{
                borderWidth: 2,
                borderColor: '#6a6a6a',
                borderRadius: 20,
                width: '100%',
                resizeMode: 'stretch',
              }}
            />
          </View>
        </ListItem.Accordion>
      </ScrollView>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  firstPar: {
    fontSize: 17,
    marginTop: '4%',
    textAlign: 'justify',
  },
  lastPar: {
    fontSize: 17,
    marginBottom: '2%',
    textAlign: 'justify',
  },
  middlePar: {
    fontSize: 17,
    marginVertical: '1%',
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  attention: {
    fontSize: 17,
    marginBottom: '2%',
    textAlign: 'justify',
    backgroundColor: '#ff663b',
    borderRadius: 20,
    padding: '3%',
  },
});

export default TutorialDialog;
