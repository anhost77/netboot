#!/bin/bash

# Script de test rapide pour vérifier que tout fonctionne

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         BetTracker Pro - Test Rapide                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

API_URL="http://localhost:3000"

# Test 1 : Health Check
echo -e "\n${BLUE}Test 1: Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check OK${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Health check échoué (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Test 2 : Registration
echo -e "\n${BLUE}Test 2: Inscription d'un nouvel utilisateur${NC}"
REGISTER_DATA='{
  "email": "test_'$(date +%s)'@example.com",
  "password": "Test123!@#",
  "firstName": "Test",
  "lastName": "User"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Inscription réussie${NC}"
    ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken' 2>/dev/null)
    echo "Token obtenu: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Inscription échouée (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Test 3 : Login avec admin
echo -e "\n${BLUE}Test 3: Connexion avec compte admin${NC}"
LOGIN_DATA='{
  "email": "admin@bettracker.pro",
  "password": "Admin123!"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Connexion admin réussie${NC}"
    ADMIN_TOKEN=$(echo "$BODY" | jq -r '.accessToken' 2>/dev/null)
    echo "Token admin obtenu: ${ADMIN_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Connexion admin échouée (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Test 4 : Get Me (endpoint protégé)
if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "\n${BLUE}Test 4: Récupération du profil utilisateur (endpoint protégé)${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $ADMIN_TOKEN")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Profil récupéré${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ Récupération du profil échouée (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
fi

# Test 5 : Vérifier PostgreSQL
echo -e "\n${BLUE}Test 5: PostgreSQL${NC}"
if sudo systemctl is-active --quiet postgresql 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL actif${NC}"

    # Compter les plans
    PLAN_COUNT=$(sudo -u postgres psql -d bettracker_dev -t -c "SELECT COUNT(*) FROM plans;" 2>/dev/null | xargs)
    if [ "$PLAN_COUNT" -eq 4 ]; then
        echo -e "${GREEN}✓ 4 plans d'abonnement présents${NC}"
    else
        echo -e "${YELLOW}⚠ Plans trouvés: $PLAN_COUNT (attendu: 4)${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL inactif${NC}"
fi

# Test 6 : Vérifier Redis
echo -e "\n${BLUE}Test 6: Redis${NC}"
if redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis actif${NC}"
else
    echo -e "${RED}✗ Redis inactif${NC}"
fi

# Résumé
echo -e "\n${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    Tests Terminés                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${YELLOW}💡 Conseil: Testez l'interface Swagger à ${GREEN}http://localhost:3000/api/docs${NC}"
echo -e "${YELLOW}💡 Visualisez la base de données avec Prisma Studio: ${GREEN}npm run prisma:studio${NC}"
echo ""
