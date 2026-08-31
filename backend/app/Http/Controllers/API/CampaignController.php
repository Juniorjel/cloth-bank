<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\CampaignRepositoryInterface;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    protected $campaignRepo;

    public function __construct(CampaignRepositoryInterface $campaignRepo)
    {
        $this->campaignRepo = $campaignRepo;
    }

    // GET /api/campaigns - Admin: all campaigns, Public: active only
    public function index(Request $request)
    {
        $user = auth('api')->user() ?? $request->user();
        if ($user && $user->isAdmin()) {
            $campaigns = $this->campaignRepo->all();
        } else {
            $campaigns = $this->campaignRepo->active();
        }

        return response()->json($campaigns);
    }

    // GET /api/campaigns/{id}
    public function show($id)
    {
        $campaign = $this->campaignRepo->find($id);
        return response()->json($campaign);
    }

    // POST /api/campaigns - Admin only
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'status'      => 'in:active,inactive',
        ]);

        $campaign = $this->campaignRepo->create($data);
        return response()->json($campaign, 201);
    }

    // PUT /api/campaigns/{id} - Admin only
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after_or_equal:start_date',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $campaign = $this->campaignRepo->update($id, $data);
        return response()->json($campaign);
    }

    // DELETE /api/campaigns/{id} - Admin only
    public function destroy($id)
    {
        $this->campaignRepo->delete($id);
        return response()->json(['message' => 'Campaign deleted']);
    }
}
