const API_BASE_URL = "http://localhost:3000/api";

export async function apiGet(endpoint)
{
    try
    {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!res.ok) throw new Error(`Error GET ${endpoint}: ${res.status}`);
        return await res.json();
    }
    catch (err)
    {
        console.error("Error en GET:", err);
        throw err;
    }
}

export async function apiPost(endpoint, data)
{
    try
    {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(`Error POST ${endpoint}: ${res.status}`);
        return await res.json();
    }
    catch (err)
    {
        console.error("Error en POST:", err);
        throw err;
    }
}

export async function apiPut(endpoint, data)
{
    try
    {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(`Error PUT ${endpoint}: ${res.status}`);
        return await res.json();
    }
    catch (err)
    {
        console.error("Error en PUT:", err);
        throw err;
    }
}

export async function apiDelete(endpoint)
{
    try
    {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, {method: "DELETE"});

        if (!res.ok) throw new Error(`Error DELETE ${endpoint}: ${res.status}`);
        return await res.json();
    }
    catch (err)
    {
        console.error("Error en DELETE:", err);
        throw err;
    }
}