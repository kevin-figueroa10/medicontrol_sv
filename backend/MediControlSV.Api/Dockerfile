FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/MediControlSV.Api/MediControlSV.Api.csproj backend/MediControlSV.Api/
RUN dotnet restore backend/MediControlSV.Api/MediControlSV.Api.csproj
COPY backend/MediControlSV.Api/ backend/MediControlSV.Api/
RUN dotnet publish backend/MediControlSV.Api/MediControlSV.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
ENV AllowedHosts=*
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "MediControlSV.Api.dll"]
