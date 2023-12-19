import { StyleSheet } from 'react-native';

const baseFontSize = 16; // Define your base font size

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%', 
    backgroundColor: '#fff',
  
  },
  headerContainer: {
    marginTop: '25%', 
  },
  headerText: {
    fontSize: 1.5 * baseFontSize, 
    fontWeight: 'bold',
    marginBottom: 0.5 * baseFontSize, 
  },
  subHeaderText: {
    fontSize: 1 * baseFontSize, 
    color: '#000',
  },
  inputContainer: {
    marginTop: '6%', 
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#4B68FF',
    padding: 10,
    fontSize: 1.1 * baseFontSize,
    marginBottom: '4%', 
    textAlignVertical: 'center',
    paddingLeft: 0,
  },
  inputLabel: {
    fontSize: 1.1 * baseFontSize,
    marginBottom: '2%', 
    color: '#000',
    fontWeight: 'bold',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4%', 
  },
  rememberMeText: {
    fontSize: 1.1 * baseFontSize,
    marginLeft: 10,
  },
  forgotPasswordText: {
    fontSize: 1.1 * baseFontSize,
    color: '#4B68FF',
    alignSelf: 'center',
  },
  orText: {
    alignSelf: 'center',
    marginVertical: '4%', 
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '10%', 
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: '4%', 
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 50,
    paddingHorizontal: '10%', 
    paddingVertical: '3%',  
  },
  signInButton: {
    backgroundColor: '#4B68FF',
    padding: '5%', 
    borderRadius: 50,
  },
  signInButtonText: {
    fontSize: 1 * baseFontSize, 
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default styles;
