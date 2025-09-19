import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIndicator,
  View,
  Text,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Updates from "expo-updates";
import { Feather } from "@expo/vector-icons";

export default function Index() {
  const { user, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    async function checkForUpdates() {
      if (Platform.OS !== 'web' && !__DEV__) {
        try {
          console.log("Verificando atualizações OTA...");
          console.log("Runtime Version:", Updates.runtimeVersion);
          console.log("Canal de atualização:", Updates.channel || "indefinido");

          setIsUpdating(true);

          const update = await Updates.checkForUpdateAsync();
          console.log("Update disponível?", update.isAvailable);

          if (update.isAvailable) {
            console.log("⬇Baixando atualização...");
            await Updates.fetchUpdateAsync();
            console.log("Atualização baixada com sucesso. Recarregando o app...");
            await Updates.reloadAsync();
          } else {
            console.log("Nenhuma atualização disponível.");
          }
        } catch (error: any) {
          console.error("Erro ao verificar/baixar atualização OTA:", error?.message || error);
        } finally {
          setIsUpdating(false);
        }
      } else {
        console.log(`Ambiente de ${Platform.OS === 'web' ? 'web' : 'desenvolvimento'}. Ignorando updates OTA.`);
        setIsUpdating(false);
      }
    }

    checkForUpdates();
  }, []);

  if (loading || isUpdating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        {isUpdating && <Text style={{ marginTop: 10, color: 'gray' }}>Verificando atualizações OTA...</Text>}
        {loading && <Text style={{ marginTop: 10, color: 'gray' }}>Carregando dados do usuário...</Text>}
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/loginScreen" />;
  }

  return <Redirect href="/(tabs)/homeScreen" />;
}