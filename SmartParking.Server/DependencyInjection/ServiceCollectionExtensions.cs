using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace SmartParking.Server.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in assemblies)
            {
                RegisterByConvention(services, assembly);
            }

            return services;
        }

        private static void RegisterByConvention(IServiceCollection services, Assembly assembly)
        {
            var types = assembly.GetTypes()
                .Where(t =>
                    t.IsClass &&
                    !t.IsAbstract &&
                    t.Namespace != null &&
                    (t.Namespace.Contains(".Services") || t.Namespace.Contains(".Repository")))
                .ToList();

            foreach (var implementation in types)
            {
                var iface = implementation.GetInterface($"I{implementation.Name}");
                if (iface != null)
                {
                    services.AddScoped(iface, implementation);
                }
            }
        }

    }
}
