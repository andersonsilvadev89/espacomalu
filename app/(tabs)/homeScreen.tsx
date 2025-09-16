import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
  Platform,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Users, Settings, LogOut, CircleHelp } from "lucide-react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// --- Constantes de Design ---
const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && screenWidth > 768; // Definição de breakpoint
const NUM_COLUMNS = 2;
const SPACING = 20;
const CARD_PADDING = 20;
const BORDER_RADIUS = 26;
const ICON_SIZE = isDesktop ? 60 : 50;
const LADO = isDesktop ? 160 : 120; // Aumenta o tamanho dos botões na web

const COLORS = {
  primary: "#007AFF",
  secondary: "#6c757dcc",
  backgroundLight: "rgba(255,255,255,0.9)",
  backgroundDark: "rgba(0,0,0,0.4)",
  cardShadow: "rgba(0, 0, 0, 0.15)",
  textPrimary: "#333333",
  textSecondary: "#555555",
  logoutRed: "#DC3545",
  logoutRedHover: "#C82333",
};

const HomeScreen = () => {
  const navigate = (path: string) => router.push(path as any);

  const mainOptions = [
    {
      label: "Reservas",
      icon: Users,
      path: "/RegistroDeAulaScreen",
    },
  ];

  const bottomRowOptions = [
    {
      type: "nav",
      label: "Configurações",
      icon: Settings,
      path: "/configuracoesScreen",
    },
    { type: "logout", label: "Sair", icon: LogOut, path: "" },
    {
      type: "nav",
      label: "Sobre o App",
      icon: CircleHelp,
      path: "/sobreScreen",
    },
  ];

  const confirmarLogout = () => {
    if(Platform.OS === 'web'){
      let resp = confirm("Tem certeza que deseja sair do aplicativo?");
      if(resp){
        (async () => {
            try {
              await signOut(auth);
              // Navega para a tela de login após o logout ser concluído
              alert("Usuario deslogado com sucesso!");
              router.replace('/(auth)/loginScreen');

            } catch (error) {
              console.error("Erro ao fazer logout: ", error);
              alert(
                "Erro ao Sair: "+"Não foi possível sair. Tente novamente."
              );
            }
        })();
      }
    }else{
      Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair do aplicativo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              // Navega para a tela de login após o logout ser concluído
              router.replace('/(auth)/loginScreen');
            } catch (error) {
              console.error("Erro ao fazer logout: ", error);
              Alert.alert(
                "Erro ao Sair",
                "Não foi possível sair. Tente novamente."
              );
            }
          },
        },
      ],
      { cancelable: true }
      );
    }

  };

  const renderGridItem = ({ item }: { item: (typeof mainOptions)[0] }) => {
    // Cálculo do tamanho otimizado para mobile e web
    const itemWidth =
      (screenWidth - SPACING * 2 - SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={[styles.card, { width: itemWidth, height: itemWidth }]} // Define a altura igual à largura
        activeOpacity={0.7}
        onPress={() => navigate(item.path)}
      >
        <IconComponent size={ICON_SIZE} color={COLORS.primary} />
        <Text style={styles.cardText}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderBottomRowItem = ({ item }: { item: (typeof bottomRowOptions)[0] }) => {
    const IconComponent = item.icon;
    const itemWidth = LADO; // Usando valor fixo
    const itemHeight = LADO; // Usando valor fixo

    if (item.type === "logout") {
      return (
        <TouchableOpacity
          style={[
            styles.logoutButtonRound,
            {
              width: itemWidth,
              height: itemHeight,
              marginHorizontal: SPACING / 2,
            },
          ]}
          activeOpacity={0.7}
          onPress={confirmarLogout}
        >
          <IconComponent size={ICON_SIZE - 14} color={COLORS.logoutRed} />
          <Text style={styles.logoutButtonRoundText}>{item.label}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={[
            styles.fixedOptionCard,
            {
              width: itemWidth,
              height: itemHeight,
              marginHorizontal: SPACING / 2,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => navigate(item.path)}
        >
          <IconComponent size={ICON_SIZE - 14} color={COLORS.primary} />
          <Text style={styles.fixedOptionText}>{item.label}</Text>
        </TouchableOpacity>
      );
    }
  };
const defaultFundoLocal = require('../../assets/images/fundo.png');

  return (

    <ImageBackground source={defaultFundoLocal} style={styles.background}>
      <View style={styles.content}>
        <FlatList
          data={mainOptions}
          renderItem={renderGridItem}
          keyExtractor={(item, index) => item.label + index}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: SPACING * 2 }} />}
        />
        <View style={styles.bottomButtonsWrapper}>
          <FlatList
            data={bottomRowOptions}
            renderItem={renderBottomRowItem}
            keyExtractor={(item, index) => item.label + index}
            numColumns={3}
            contentContainerStyle={styles.bottomRowGrid}
            columnWrapperStyle={styles.bottomRowGrid}
            scrollEnabled={false}
          />
        </View>
      </View>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
    background: {
    flex: 1,
    width: '100%',
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    maxWidth: 450,
    paddingTop: 10,
    paddingHorizontal: SPACING,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.17)000ff",
    alignSelf: 'center',
    borderRadius: 20,
  },
  gridContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING - 10,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: SPACING - 5,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS,
    paddingVertical: CARD_PADDING,
    paddingHorizontal: CARD_PADDING,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: SPACING / 2,
    maxWidth: 400,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  bottomButtonsWrapper: {
    backgroundColor: "transparent",
    paddingVertical: SPACING / 2,
    marginBottom: Platform.OS === "ios" ? 10 : 0,
    width: isDesktop ? 500 : "100%", // Ajusta a largura para desktop ou mobile
    alignSelf: "center",
  },
  bottomRowGrid: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING,
  },
  fixedOptionCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS,
    paddingVertical: CARD_PADDING,
    paddingHorizontal: CARD_PADDING / 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: LADO,
    width: LADO,
  },
  fixedOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 15,
  },
  logoutButtonRound: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    height: LADO,
    width: LADO,
  },
  logoutButtonRoundText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.logoutRed,
    textAlign: "center",
    marginTop: 6,
  },
});

export default HomeScreen;